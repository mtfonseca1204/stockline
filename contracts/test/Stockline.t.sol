// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {Test} from "forge-std/Test.sol";
import {IMorpho, MarketParams, Id, Position} from "morpho-blue/src/interfaces/IMorpho.sol";
import {MarketParamsLib} from "morpho-blue/src/libraries/MarketParamsLib.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {StocklineOracle} from "../src/StocklineOracle.sol";
import {StocklineLens} from "../src/StocklineLens.sol";
import {StocklineRepayAdapter} from "../src/StocklineRepayAdapter.sol";
import {TestToken, TestFeed, TestStatus, TestSwap} from "./mocks/Mocks.sol";

abstract contract StocklineFixture is Test {
    using MarketParamsLib for MarketParams;
    IMorpho internal core;
    TestToken internal usdc;
    TestToken[4] internal tokens;
    TestFeed[4] internal feeds;
    TestFeed internal usd;
    TestFeed internal sequencer;
    TestStatus internal guard;
    TestSwap internal swap;
    StocklineRepayAdapter internal adapter;
    StocklineLens internal lens;
    MarketParams[] internal markets;
    address internal user = address(0xB0B);
    address internal lender = address(0xA11CE);
    address internal liquidator = address(0x111);

    function setUp() public virtual {
        vm.warp(10 days);
        core = IMorpho(deployCode("Morpho.sol:Morpho", abi.encode(address(this))));
        address irm = deployCode("AdaptiveCurveIrm.sol:AdaptiveCurveIrm", abi.encode(address(core)));
        core.enableIrm(irm);
        core.enableLltv(0.8e18);
        usdc = new TestToken("tUSDC", 6);
        usd = new TestFeed(8, 1e8);
        sequencer = new TestFeed(0, 0);
        guard = new TestStatus();
        swap = new TestSwap(IERC20(address(usdc)));
        lens = new StocklineLens();
        usdc.mint(lender, 4_000_000e6);
        usdc.mint(address(swap), 1_000_000e6);
        usdc.mint(liquidator, 1_000_000e6);
        for (uint256 i; i < 4; ++i) {
            uint8 d = i == 0 ? 18 : 8;
            tokens[i] = new TestToken("tSTOCK", d);
            feeds[i] = new TestFeed(8, 100e8);
            StocklineOracle oracle =
                new StocklineOracle(address(tokens[i]), feeds[i], usd, sequencer, guard, d, 6, 2 days, 2 days, 1 hours);
            MarketParams memory mp = MarketParams(address(usdc), address(tokens[i]), address(oracle), irm, 0.8e18);
            markets.push(mp);
            core.createMarket(mp);
            swap.setPrice(address(tokens[i]), oracle.price());
            tokens[i].mint(user, 100 * 10 ** d);
            vm.startPrank(lender);
            usdc.approve(address(core), type(uint256).max);
            core.supply(mp, 1_000_000e6, 0, lender, "");
            vm.stopPrank();
            vm.startPrank(user);
            tokens[i].approve(address(core), type(uint256).max);
            usdc.approve(address(core), type(uint256).max);
            vm.stopPrank();
        }
        adapter = new StocklineRepayAdapter(core, IERC20(address(usdc)), swap, markets);
        vm.prank(user);
        core.setAuthorization(address(adapter), true);
    }

    function open(uint256 i) internal {
        vm.startPrank(user);
        core.supplyCollateral(markets[i], 10 * 10 ** tokens[i].decimals(), user, "");
        core.borrow(markets[i], 400e6, 0, user, user);
        vm.stopPrank();
    }

    function request(uint256 i) internal view returns (StocklineRepayAdapter.RepayRequest memory r) {
        r = StocklineRepayAdapter.RepayRequest(
            Id.unwrap(markets[i].id()),
            100e6,
            false,
            101e6,
            2 * 10 ** tokens[i].decimals(),
            100e6,
            1.1e18,
            vm.getBlockTimestamp() + 300,
            ""
        );
    }
}

contract StocklineTest is StocklineFixture {
    using MarketParamsLib for MarketParams;

    function testFourMarketLifecycle() public {
        for (uint256 i; i < 4; ++i) {
            open(i);
            vm.warp(vm.getBlockTimestamp() + 1 hours);
            assertGt(lens.snapshot(core, markets[i], user, 0.5e18).debtAssetsRaw, 400e6);
            vm.prank(user);
            core.repay(markets[i], 50e6, 0, user, "");
            StocklineRepayAdapter.RepayRequest memory r = request(i);
            vm.prank(user);
            adapter.repayWithCollateral(r);
            assertEq(tokens[i].balanceOf(address(swap)), 2 * 10 ** tokens[i].decimals());
            assertEq(usdc.balanceOf(address(adapter)), 0);
            // Quit by live shares; interest is funded from the user's wallet.
            usdc.mint(user, 1000e6);
            vm.startPrank(user);
            core.repay(markets[i], 0, core.position(markets[i].id(), user).borrowShares, user, "");
            core.withdrawCollateral(markets[i], core.position(markets[i].id(), user).collateral, user, user);
            vm.stopPrank();
            assertEq(core.position(markets[i].id(), user).borrowShares, 0);
            assertEq(core.position(markets[i].id(), user).collateral, 0);
            uint256 supplyShares = core.position(markets[i].id(), lender).supplyShares;
            vm.prank(lender);
            core.withdraw(markets[i], 0, supplyShares, lender, lender);
        }
    }

    function testScaleAndUsdcDepeg() public {
        assertEq(StocklineOracle(markets[0].oracle).price(), 100e24);
        usd.set(0.5e8, block.timestamp);
        assertEq(StocklineOracle(markets[0].oracle).price(), 200e24);
    }

    function testRepayAllFromSaleAndDonationIsolation() public {
        open(0);
        usdc.mint(address(adapter), 123);
        StocklineRepayAdapter.RepayRequest memory r = request(0);
        r.repayAll = true;
        r.repayAssets = 0;
        r.maxRepayAssets = 401e6;
        r.collateralAssetsToSell = 5e18;
        vm.prank(user);
        adapter.repayWithCollateral(r);
        assertEq(core.position(markets[0].id(), user).borrowShares, 0);
        assertEq(usdc.balanceOf(address(adapter)), 123);
    }

    function testAtomicInsufficientOutputDespiteDonation() public {
        open(0);
        usdc.mint(address(adapter), 1_000e6);
        swap.setPrice(address(tokens[0]), 1e24);
        StocklineRepayAdapter.RepayRequest memory r = request(0);
        r.minUsdcOut = 1;
        vm.expectRevert(StocklineRepayAdapter.InsufficientSwapOutput.selector);
        vm.prank(user);
        adapter.repayWithCollateral(r);
        assertEq(core.position(markets[0].id(), user).collateral, 10e18);
        assertEq(lens.snapshot(core, markets[0], user, 0.5e18).debtAssetsRaw, 400e6);
    }

    function testCallbackAndReentry() public {
        vm.expectRevert(StocklineRepayAdapter.UnauthorizedCallback.selector);
        adapter.onMorphoRepay(1, "");
        vm.expectRevert(StocklineRepayAdapter.InvalidCallbackState.selector);
        vm.prank(address(core));
        adapter.onMorphoRepay(1, "");
        open(0);
        StocklineRepayAdapter.RepayRequest memory r = request(0);
        swap.attack(address(adapter), abi.encodeCall(adapter.repayWithCollateral, (r)));
        vm.expectRevert("attack rejected");
        vm.prank(user);
        adapter.repayWithCollateral(r);
    }

    function testOracleUnavailableAllowsRepayAndSupply() public {
        open(0);
        guard.set(false);
        assertFalse(lens.snapshot(core, markets[0], user, 0.5e18).oracleValid);
        vm.startPrank(user);
        core.supplyCollateral(markets[0], 1e18, user, "");
        vm.expectRevert();
        core.borrow(markets[0], 1, 0, user, user);
        core.repay(markets[0], 0, core.position(markets[0].id(), user).borrowShares, user, "");
        core.withdrawCollateral(markets[0], 11e18, user, user);
        vm.stopPrank();
    }

    function testInvalidOracleValues() public {
        int256[3] memory values = [int256(0), int256(-1), int256(100e8)];
        for (uint256 i; i < 3; ++i) {
            uint256 time = i == 2 ? block.timestamp + 1 : block.timestamp;
            feeds[0].set(values[i], time);
            vm.expectRevert();
            StocklineOracle(markets[0].oracle).price();
        }
        feeds[0].set(100e8, block.timestamp - 3 days);
        vm.expectRevert();
        StocklineOracle(markets[0].oracle).price();
        feeds[0].set(100e8, block.timestamp);
        sequencer.set(1, block.timestamp);
        vm.expectRevert();
        StocklineOracle(markets[0].oracle).price();
        sequencer.set(0, block.timestamp);
        sequencer.setStarted(block.timestamp);
        vm.expectRevert();
        StocklineOracle(markets[0].oracle).price();
    }

    function testRevocationAndTransferPolicy() public {
        open(0);
        vm.prank(user);
        core.setAuthorization(address(adapter), false);
        StocklineRepayAdapter.RepayRequest memory r = request(0);
        vm.expectRevert();
        vm.prank(user);
        adapter.repayWithCollateral(r);
        vm.prank(user);
        core.setAuthorization(address(adapter), true);
        tokens[0].setBlocked(address(swap), true);
        vm.expectRevert();
        vm.prank(user);
        adapter.repayWithCollateral(r);
        assertEq(core.position(markets[0].id(), user).collateral, 10e18);
    }

    function testBoundsAndHealth() public {
        open(0);
        StocklineRepayAdapter.RepayRequest memory r = request(0);
        r.deadline = block.timestamp - 1;
        vm.expectRevert(StocklineRepayAdapter.ExpiredRequest.selector);
        vm.prank(user);
        adapter.repayWithCollateral(r);
        r.deadline = block.timestamp + 1;
        r.maxRepayAssets = 1;
        vm.expectRevert(StocklineRepayAdapter.MaxRepayExceeded.selector);
        vm.prank(user);
        adapter.repayWithCollateral(r);
        r.maxRepayAssets = 101e6;
        r.minHealthFactorWad = 100e18;
        vm.expectRevert(StocklineRepayAdapter.UnhealthyPosition.selector);
        vm.prank(user);
        adapter.repayWithCollateral(r);
    }

    function testLiquidationAndBadDebt() public {
        open(0);
        feeds[0].set(10e8, block.timestamp);
        uint256 supplyBefore = core.market(markets[0].id()).totalSupplyAssets;
        vm.startPrank(liquidator);
        usdc.approve(address(core), type(uint256).max);
        core.liquidate(markets[0], user, 10e18, 0, "");
        tokens[0].approve(address(swap), 10e18);
        swap.setPrice(address(tokens[0]), 10e24);
        swap.sell(address(tokens[0]), 10e18, 1, block.timestamp, "");
        vm.stopPrank();
        assertEq(core.position(markets[0].id(), user).borrowShares, 0);
        assertLt(core.market(markets[0].id()).totalSupplyAssets, supplyBefore);
    }

    function testLiquidityIsIsolated() public {
        uint256 supplyShares = core.position(markets[0].id(), lender).supplyShares;
        vm.prank(lender);
        core.withdraw(markets[0], 0, supplyShares, lender, lender);
        vm.startPrank(user);
        core.supplyCollateral(markets[0], 10e18, user, "");
        vm.expectRevert();
        core.borrow(markets[0], 1e6, 0, user, user);
        vm.stopPrank();
    }

    function testFuzzPartialRepayment(uint96 amount) public {
        open(0);
        amount = uint96(bound(amount, 1, 399e6));
        vm.prank(user);
        core.repay(markets[0], amount, 0, user, "");
        assertLe(lens.snapshot(core, markets[0], user, 0.5e18).debtAssetsRaw, 400e6 - amount + 1);
    }
}
