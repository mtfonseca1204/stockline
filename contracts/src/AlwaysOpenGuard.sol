// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {IMarketStatus} from "./interfaces/IStockline.sol";
import {ICoinbaseOracleRegistry} from "./NasdaqSessionGuard.sol";
/// No calendar or equity-price freshness requirement. Registry and admin pauses remain effective.
contract AlwaysOpenGuard is IMarketStatus {
    error Unauthorized();
    error InvalidConfiguration();
    address public immutable admin;
    address public immutable token;
    ICoinbaseOracleRegistry public immutable registry;
    bool public paused;
    event PauseChanged(bool paused);
    constructor(address admin_, address token_, ICoinbaseOracleRegistry registry_) {
        if (admin_ == address(0) || token_ == address(0) || address(registry_).code.length == 0) revert InvalidConfiguration();
        admin = admin_; token = token_; registry = registry_;
    }
    function setPaused(bool value) external {
        if (msg.sender != admin) revert Unauthorized();
        paused = value; emit PauseChanged(value);
    }
    function isValid(address asset) external view returns (bool) {
        if (asset != token || paused) return false;
        (uint256 multiplier, bool stopped) = registry.getOracleParams(asset);
        return multiplier > 0 && !stopped;
    }
}
