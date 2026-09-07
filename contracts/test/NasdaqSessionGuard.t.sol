// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {Test} from "forge-std/Test.sol";
import {NasdaqSessionGuard, ICoinbaseOracleRegistry} from "../src/NasdaqSessionGuard.sol";
import {TestFeed} from "./mocks/Mocks.sol";

contract RegistryFixture is ICoinbaseOracleRegistry {
    bool public paused;

    function set(bool value) external {
        paused = value;
    }

    function getOracleParams(address) external view returns (uint256, bool) {
        return (1e18, paused);
    }
}

contract NasdaqSessionGuardTest is Test {
    NasdaqSessionGuard guard;
    TestFeed feed;
    RegistryFixture registry;
    address token = address(123);
    uint64 opening = 1788528600; // 2026-09-04 13:30 UTC.

    function setUp() public {
        vm.warp(opening);
        feed = new TestFeed(8, 230e8);
        registry = new RegistryFixture();
        NasdaqSessionGuard.Session[] memory calendar = new NasdaqSessionGuard.Session[](1);
        calendar[0] = NasdaqSessionGuard.Session(opening, opening + 23400);
        guard = new NasdaqSessionGuard(address(this), token, feed, registry, calendar);
    }

    function testSessionEdgesAndUnknownDates() public {
        assertTrue(guard.isValid(token));
        vm.warp(opening - 1);
        assertFalse(guard.isValid(token));
        vm.warp(opening + 23400);
        assertFalse(guard.isValid(token));
        vm.warp(opening + 3 days);
        assertFalse(guard.isValid(token));
    }

    function testRegistryAndFreshSessionPrice() public {
        registry.set(true);
        assertFalse(guard.isValid(token));
        registry.set(false);
        feed.set(230e8, opening - 1);
        assertFalse(guard.isValid(token));
        feed.set(230e8, opening + 1);
        assertFalse(guard.isValid(token));
        assertFalse(guard.isValid(address(456)));
    }

    function testAdminPauseRecoveryNeedsNewPrice() public {
        vm.prank(address(456));
        vm.expectRevert(NasdaqSessionGuard.Unauthorized.selector);
        guard.setPaused(true);
        guard.setPaused(true);
        assertFalse(guard.isValid(token));
        vm.warp(opening + 1);
        guard.setPaused(false);
        vm.warp(opening + 3602);
        assertFalse(guard.isValid(token));
        feed.set(230e8, block.timestamp);
        assertTrue(guard.isValid(token));
    }
}
