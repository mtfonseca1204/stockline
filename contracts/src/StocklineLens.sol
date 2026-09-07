// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {IMorpho, MarketParams, Position, Market} from "morpho-blue/src/interfaces/IMorpho.sol";
import {IOracle} from "morpho-blue/src/interfaces/IOracle.sol";
import {IIrm} from "morpho-blue/src/interfaces/IIrm.sol";
import {MarketParamsLib} from "morpho-blue/src/libraries/MarketParamsLib.sol";
import {MorphoBalancesLib} from "morpho-blue/src/libraries/periphery/MorphoBalancesLib.sol";
import {SharesMathLib} from "morpho-blue/src/libraries/SharesMathLib.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract StocklineLens {
    using MarketParamsLib for MarketParams;
    using MorphoBalancesLib for IMorpho;
    using SharesMathLib for uint256;

    struct Snapshot {
        uint256 collateralRaw;
        uint256 borrowShares;
        uint256 debtAssetsRaw;
        uint256 collateralValueUsdcRaw;
        uint256 availableBorrowRaw;
        uint256 liquidity;
        uint256 healthFactorWad;
        uint256 borrowAprWad;
        uint256 price;
        uint256 snapshotBlock;
        uint256 timestamp;
        bool oracleValid;
    }

    function snapshot(IMorpho morpho, MarketParams memory mp, address user, uint256 uiLtv)
        external
        view
        returns (Snapshot memory s)
    {
        require(uiLtv < mp.lltv, "ui ltv");
        require(morpho.market(mp.id()).lastUpdate != 0, "market missing");
        Position memory p = morpho.position(mp.id(), user);
        s.collateralRaw = p.collateral;
        s.borrowShares = p.borrowShares;
        (uint256 supplied,, uint256 borrowed, uint256 shares) = morpho.expectedMarketBalances(mp);
        s.debtAssetsRaw = uint256(p.borrowShares).toAssetsUp(borrowed, shares);
        s.liquidity = supplied > borrowed ? supplied - borrowed : 0;
        Market memory market = morpho.market(mp.id());
        s.borrowAprWad = IIrm(mp.irm).borrowRateView(mp, market) * 365 days;
        s.snapshotBlock = block.number;
        s.timestamp = block.timestamp;
        try IOracle(mp.oracle).price() returns (uint256 value) {
            if (value == 0) return s;
            s.oracleValid = true;
            s.price = value;
            s.collateralValueUsdcRaw = Math.mulDiv(p.collateral, value, 1e36);
            uint256 limit = Math.mulDiv(s.collateralValueUsdcRaw, uiLtv, 1e18);
            if (limit > s.debtAssetsRaw) s.availableBorrowRaw = Math.min(limit - s.debtAssetsRaw, s.liquidity);
            // Keep two raw units for share rounding. Quotes must still be simulated.
            s.availableBorrowRaw = s.availableBorrowRaw > 2 ? s.availableBorrowRaw - 2 : 0;
            if (s.debtAssetsRaw != 0) {
                s.healthFactorWad =
                    Math.mulDiv(Math.mulDiv(s.collateralValueUsdcRaw, mp.lltv, 1e18), 1e18, s.debtAssetsRaw);
            }
        } catch {}
    }
}
