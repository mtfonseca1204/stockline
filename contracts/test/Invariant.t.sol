// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {StocklineFixture} from "./Stockline.t.sol";
import {Test} from "forge-std/Test.sol";
import {IMorpho, MarketParams} from "morpho-blue/src/interfaces/IMorpho.sol";
import {MarketParamsLib} from "morpho-blue/src/libraries/MarketParamsLib.sol";
import {StocklineLens} from "../src/StocklineLens.sol";

contract CreditHandler is Test {
    IMorpho core;
    MarketParams mp;
    StocklineLens lens;
    address user;

    constructor(IMorpho c, MarketParams memory m, StocklineLens l, address u) {
        core = c;
        mp = m;
        lens = l;
        user = u;
    }

    function borrowOrRepay(uint96 raw, bool repay) external {
        StocklineLens.Snapshot memory s = lens.snapshot(core, mp, user, 0.5e18);
        uint256 ceiling = repay ? s.debtAssetsRaw : s.availableBorrowRaw;
        if (ceiling <= 2) return;
        uint256 amount = bound(raw, 1, ceiling - 1);
        vm.startPrank(user);
        if (repay) core.repay(mp, amount, 0, user, "");
        else core.borrow(mp, amount, 0, user, user);
        vm.stopPrank();
    }
}

contract CreditInvariantTest is StocklineFixture {
    using MarketParamsLib for MarketParams;

    function setUp() public override {
        super.setUp();
        open(0);
        CreditHandler handler = new CreditHandler(core, markets[0], lens, user);
        targetContract(address(handler));
    }

    function invariantUserPositionAndAdapterBalances() public view {
        assertEq(core.position(markets[0].id(), user).collateral, 10e18);
        assertEq(usdc.balanceOf(address(adapter)), 0);
        assertEq(tokens[0].balanceOf(address(adapter)), 0);
        StocklineLens.Snapshot memory s = lens.snapshot(core, markets[0], user, 0.5e18);
        assertLe(s.debtAssetsRaw, 500e6);
        assertEq(
            core.market(markets[0].id()).totalBorrowAssets + s.liquidity, core.market(markets[0].id()).totalSupplyAssets
        );
    }
}
