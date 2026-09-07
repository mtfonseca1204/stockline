// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {IFeed, IMarketStatus} from "./interfaces/IStockline.sol";

interface ICoinbaseOracleRegistry {
    function getOracleParams(address token) external view returns (uint256 multiplier, bool paused);
}

/// Pilot calendar: immutable UTC sessions sourced from Nasdaq. Unknown dates fail closed.
/// Admin can pause/unpause, never add sessions or replace a feed. Unpause requires a new price.
contract NasdaqSessionGuard is IMarketStatus {
    error InvalidCalendar();
    error Unauthorized();

    struct Session {
        uint64 open;
        uint64 close;
    }
    mapping(uint256 => Session) public sessions;
    address public immutable admin;
    address public immutable token;
    IFeed public immutable feed;
    ICoinbaseOracleRegistry public immutable registry;
    bytes32 public immutable calendarHash;
    bool public paused;
    uint256 public resumedAt;
    event PauseChanged(bool paused, uint256 timestamp);

    constructor(
        address admin_,
        address token_,
        IFeed feed_,
        ICoinbaseOracleRegistry registry_,
        Session[] memory calendar
    ) {
        if (
            admin_ == address(0) || token_ == address(0) || address(feed_).code.length == 0
                || address(registry_).code.length == 0 || calendar.length == 0 || calendar.length > 260
        ) revert InvalidCalendar();
        admin = admin_;
        token = token_;
        feed = feed_;
        registry = registry_;
        uint256 lastClose;
        for (uint256 i; i < calendar.length; ++i) {
            Session memory s = calendar[i];
            if (
                s.open <= lastClose || s.close <= s.open || s.close - s.open > 6.5 hours
                    || s.open / 1 days != (s.close - 1) / 1 days || sessions[s.open / 1 days].open != 0
            ) revert InvalidCalendar();
            sessions[s.open / 1 days] = s;
            lastClose = s.close;
        }
        calendarHash = keccak256(abi.encode(calendar));
    }

    function setPaused(bool value) external {
        if (msg.sender != admin) revert Unauthorized();
        if (paused == value) return;
        paused = value;
        if (!value) resumedAt = block.timestamp;
        emit PauseChanged(value, block.timestamp);
    }

    function isValid(address asset) external view returns (bool) {
        Session memory s = sessions[block.timestamp / 1 days];
        if (asset != token || paused || s.open == 0 || block.timestamp < s.open || block.timestamp >= s.close) {
            return false;
        }
        if (resumedAt != 0 && block.timestamp - resumedAt <= 1 hours) return false;
        (uint256 multiplier, bool stopped) = registry.getOracleParams(asset);
        if (stopped || multiplier == 0) return false;
        (,,, uint256 updated,) = feed.latestRoundData();
        return updated >= s.open && updated <= block.timestamp && updated >= resumedAt;
    }
}
