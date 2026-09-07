// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {Test} from "forge-std/Test.sol";
import {AlwaysOpenGuard} from "../src/AlwaysOpenGuard.sol";
import {StocklineOracle} from "../src/StocklineOracle.sol";
import {RegistryFixture} from "./NasdaqSessionGuard.t.sol";
import {TestFeed} from "./mocks/Mocks.sol";
contract AlwaysOpenGuardTest is Test {
    function testOldEquityPriceAcceptedButStablecoinAndPausesEnforced() public {
        vm.warp(1788528600);
        TestFeed equity = new TestFeed(8,230e8);
        TestFeed stable = new TestFeed(8,1e8);
        TestFeed sequencer = new TestFeed(0,0);
        sequencer.setStarted(block.timestamp - 2 hours);
        RegistryFixture registry = new RegistryFixture();
        AlwaysOpenGuard guard = new AlwaysOpenGuard(address(this),address(123),registry);
        StocklineOracle oracle = new StocklineOracle(address(123),equity,stable,sequencer,guard,8,6,type(uint256).max,86400,3600);
        uint256 price = oracle.price();
        vm.warp(block.timestamp + 30 days);
        vm.expectRevert(StocklineOracle.InvalidPrice.selector); oracle.price();
        stable.set(1e8,block.timestamp);
        assertEq(oracle.price(),price);
        registry.set(true);
        vm.expectRevert(StocklineOracle.InvalidSession.selector); oracle.price();
        registry.set(false);
        guard.setPaused(true);
        vm.expectRevert(StocklineOracle.InvalidSession.selector); oracle.price();
        guard.setPaused(false);
        assertEq(oracle.price(),price);
        vm.prank(address(999)); vm.expectRevert(AlwaysOpenGuard.Unauthorized.selector); guard.setPaused(true);
        equity.set(-1,block.timestamp);
        vm.expectRevert(StocklineOracle.InvalidPrice.selector); oracle.price();
    }
}
