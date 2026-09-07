// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IFeed, IMarketStatus} from "./interfaces/IStockline.sol";

contract StocklineOracle {
    error InvalidPrice();
    error InvalidSession();
    error SequencerUnavailable();
    error InvalidConfiguration();
    IFeed public immutable collateralFeed;
    IFeed public immutable loanFeed;
    IFeed public immutable sequencer;
    IMarketStatus public immutable status;
    address public immutable collateral;
    uint256 public immutable collateralMaxAge;
    uint256 public immutable loanMaxAge;
    uint256 public immutable gracePeriod;
    uint256 public immutable scale;

    constructor(
        address token,
        IFeed equity,
        IFeed loan,
        IFeed uptime,
        IMarketStatus guard,
        uint8 collateralDecimals,
        uint8 loanDecimals,
        uint256 equityAge,
        uint256 loanAge,
        uint256 grace
    ) {
        if (token == address(0) || address(guard) == address(0) || equityAge == 0 || loanAge == 0 || grace == 0) revert InvalidConfiguration();
        int256 exponent = int256(36) + int256(uint256(loanDecimals)) - int256(uint256(collateralDecimals))
            + int256(uint256(loan.decimals())) - int256(uint256(equity.decimals()));
        if (exponent < 0 || exponent > 77) revert InvalidConfiguration();
        collateral = token;
        collateralFeed = equity;
        loanFeed = loan;
        sequencer = uptime;
        status = guard;
        collateralMaxAge = equityAge;
        loanMaxAge = loanAge;
        gracePeriod = grace;
        scale = 10 ** uint256(exponent);
    }

    function price() external view returns (uint256) {
        (, int256 answer, uint256 startedAt, uint256 updatedAt,) = sequencer.latestRoundData();
        if (
            answer != 0 || startedAt == 0 || startedAt > block.timestamp || updatedAt > block.timestamp
                || updatedAt == 0 || block.timestamp - startedAt <= gracePeriod
        ) revert SequencerUnavailable();
        if (!status.isValid(collateral)) revert InvalidSession();
        uint256 value = Math.mulDiv(read(collateralFeed, collateralMaxAge), scale, read(loanFeed, loanMaxAge));
        if (value == 0) revert InvalidPrice();
        return value;
    }

    function read(IFeed feed, uint256 maxAge) internal view returns (uint256) {
        (uint80 round, int256 answer,, uint256 updated, uint80 answered) = feed.latestRoundData();
        if (
            answer <= 0 || updated == 0 || updated > block.timestamp || block.timestamp - updated > maxAge
                || answered < round
        ) revert InvalidPrice();
        return uint256(answer);
    }
}
