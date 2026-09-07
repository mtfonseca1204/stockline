// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {StocklineFixture} from "./Stockline.t.sol";
import {MarketParams} from "morpho-blue/src/interfaces/IMorpho.sol";
import {MarketParamsLib} from "morpho-blue/src/libraries/MarketParamsLib.sol";
import {StocklineOracle} from "../src/StocklineOracle.sol";
import {StocklineRepayAdapter} from "../src/StocklineRepayAdapter.sol";

contract BoundariesTest is StocklineFixture {
    using MarketParamsLib for MarketParams;

    function testHealthEqualityAndOneRawUnit() public {
        vm.startPrank(user);
        core.supplyCollateral(markets[0], 10e18, user, "");
        core.borrow(markets[0], 800e6, 0, user, user);
        vm.expectRevert();
        core.borrow(markets[0], 1, 0, user, user);
        vm.expectRevert();
        core.withdrawCollateral(markets[0], 1, user, user);
        core.repay(markets[0], 1, 0, user, "");
        core.withdrawCollateral(markets[0], 1, user, user);
        vm.stopPrank();
    }

    function testAdjustedFeedIsNotMultipliedAgain() public {
        feeds[0].set(102e8, block.timestamp);
        assertEq(StocklineOracle(markets[0].oracle).price(), 102e24);
    }

    function testFrozenOracleBlocksLiquidation() public {
        open(0);
        guard.set(false);
        vm.expectRevert();
        core.liquidate(markets[0], user, 1e18, 0, "");
    }

    function testTransferRestrictionsOnEachCustodyPath() public {
        open(0);
        address[4] memory actors = [user, address(core), address(adapter), address(swap)];
        for (uint256 i; i < actors.length; i++) {
            tokens[0].setBlocked(actors[i], true);
            if (i == 0) {
                vm.startPrank(user);
                vm.expectRevert();
                core.supplyCollateral(markets[0], 1, user, "");
                vm.stopPrank();
            } else {
                StocklineRepayAdapter.RepayRequest memory r = request(0);
                vm.prank(user);
                vm.expectRevert();
                adapter.repayWithCollateral(r);
            }
            tokens[0].setBlocked(actors[i], false);
        }
    }

    function testLenderCannotWithdrawBorrowedLiquidity() public {
        open(0);
        vm.startPrank(lender);
        vm.expectRevert();
        core.withdraw(markets[0], 1_000_000e6, 0, lender, lender);
        vm.stopPrank();
    }
}
