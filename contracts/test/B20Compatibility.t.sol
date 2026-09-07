// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;
import {B20Test} from "base-std-test/lib/B20Test.sol";
import {B20Constants} from "base-std/lib/B20Constants.sol";
import {IMorpho, MarketParams, Id} from "morpho-blue/src/interfaces/IMorpho.sol";
import {MarketParamsLib} from "morpho-blue/src/libraries/MarketParamsLib.sol";
import {IB20} from "base-std/interfaces/IB20.sol";

interface IDemoToken {
    function mint(address, uint256) external;
    function approve(address, uint256) external returns (bool);
}

interface IDemoSwap {
    function setPrice(address, uint256) external;
}

interface IAdapter {
    struct Request {
        bytes32 marketId;
        uint256 repayAssets;
        bool repayAll;
        uint256 maxRepayAssets;
        uint256 collateralAssetsToSell;
        uint256 minUsdcOut;
        uint256 minHealthFactorWad;
        uint256 deadline;
        bytes routeData;
    }
    function repayWithCollateral(Request calldata) external returns (uint256, uint256, uint256);
}

contract B20CompatibilityTest is B20Test {
    using MarketParamsLib for MarketParams;
    IMorpho core;
    MarketParams mp;
    IDemoToken loan;
    address exchange;
    IAdapter adapter;

    function setUp() public override {
        super.setUp();
        vm.warp(10 days);
        core = IMorpho(deployCode("Morpho.sol:Morpho", abi.encode(address(this))));
        address irm = deployCode("AdaptiveCurveIrm.sol:AdaptiveCurveIrm", abi.encode(address(core)));
        core.enableIrm(irm);
        core.enableLltv(0.8e18);
        loan = IDemoToken(deployCode("Mocks.sol:TestToken", abi.encode("USDC", uint8(6))));
        address feed = deployCode("Mocks.sol:TestFeed", abi.encode(uint8(8), int256(100e8)));
        address usd = deployCode("Mocks.sol:TestFeed", abi.encode(uint8(8), int256(1e8)));
        address seq = deployCode("Mocks.sol:TestFeed", abi.encode(uint8(0), int256(0)));
        address status = deployCode("Mocks.sol:TestStatus");
        address oracle = deployCode(
            "StocklineOracle.sol:StocklineOracle",
            abi.encode(
                address(token),
                feed,
                usd,
                seq,
                status,
                token.decimals(),
                uint8(6),
                uint256(2 days),
                uint256(2 days),
                uint256(1 hours)
            )
        );
        mp = MarketParams(address(loan), address(token), oracle, irm, 0.8e18);
        core.createMarket(mp);
        loan.mint(address(this), 10000e6);
        loan.approve(address(core), 10000e6);
        core.supply(mp, 10000e6, 0, address(this), "");
        exchange = deployCode("Mocks.sol:TestSwap", abi.encode(address(loan)));
        loan.mint(exchange, 10000e6);
        IDemoSwap(exchange).setPrice(address(token), 100 * 10 ** (36 + 6 - token.decimals()));
        MarketParams[] memory list = new MarketParams[](1);
        list[0] = mp;
        adapter = IAdapter(
            deployCode("StocklineRepayAdapter.sol:StocklineRepayAdapter", abi.encode(core, loan, exchange, list))
        );
        vm.prank(admin);
        token.grantRole(B20Constants.MINT_ROLE, address(this));
        token.mint(alice, 100 * 10 ** token.decimals());
    }

    function testB20CoreAdapterTransfers() public {
        uint256 unit = 10 ** token.decimals();
        vm.startPrank(alice);
        token.approve(address(core), 10 * unit);
        core.supplyCollateral(mp, 10 * unit, alice, "");
        core.borrow(mp, 400e6, 0, alice, alice);
        core.setAuthorization(address(adapter), true);
        adapter.repayWithCollateral(
            IAdapter.Request(Id.unwrap(mp.id()), 100e6, false, 101e6, 2 * unit, 100e6, 1e18, block.timestamp + 300, "")
        );
        assertEq(core.position(mp.id(), alice).collateral, 8 * unit);
        assertEq(token.balanceOf(exchange), 2 * unit);
        loan.approve(address(core), 1000e6);
        core.repay(mp, 0, core.position(mp.id(), alice).borrowShares, alice, "");
        core.withdrawCollateral(mp, 8 * unit, alice, alice);
        vm.stopPrank();
        assertEq(token.balanceOf(alice), 98 * unit);
    }

    function testNativeBackendRequiredWhenRequested() public view {
        if (vm.envOr("REQUIRE_NATIVE_B20", false)) require(livePrecompiles, "Native Base backend unavailable");
    }
}
