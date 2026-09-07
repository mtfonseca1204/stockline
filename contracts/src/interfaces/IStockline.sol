// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IFeed {
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

/// Implementations must validate registry pause AND a verifiable session source.
/// No production guard is supplied until those sources are verified.
interface IMarketStatus {
    function isValid(address token) external view returns (bool);
}

interface IStocklineSwap {
    function sell(address token, uint256 amount, uint256 minimum, uint256 deadline, bytes calldata route)
        external
        returns (uint256);
}
