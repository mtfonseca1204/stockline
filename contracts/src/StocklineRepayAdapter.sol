// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {IMorpho, MarketParams, Id} from "morpho-blue/src/interfaces/IMorpho.sol";
import {MarketParamsLib} from "morpho-blue/src/libraries/MarketParamsLib.sol";
import {MorphoBalancesLib} from "morpho-blue/src/libraries/periphery/MorphoBalancesLib.sol";
import {IOracle} from "morpho-blue/src/interfaces/IOracle.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IStocklineSwap} from "./interfaces/IStockline.sol";

contract StocklineRepayAdapter {
    using SafeERC20 for IERC20;
    using MarketParamsLib for MarketParams;
    using MorphoBalancesLib for IMorpho;
    error UnsupportedMarket();
    error ExpiredRequest();
    error UnauthorizedCallback();
    error InvalidCallbackState();
    error InvalidRequest();
    error MaxRepayExceeded();
    error InsufficientSwapOutput();
    error UnhealthyPosition();

    struct RepayRequest {
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
    IMorpho public immutable morpho;
    IERC20 public immutable usdc;
    IStocklineSwap public immutable swap;
    mapping(bytes32 => bool) public supported;
    uint256 private phase;
    bytes32 private operationHash;
    uint256 public nonce;
    event RepayWithCollateral(
        address indexed user,
        bytes32 indexed marketId,
        uint256 collateralSold,
        uint256 repaidAssets,
        uint256 usdcRefunded
    );

    constructor(IMorpho core, IERC20 loan, IStocklineSwap exchange, MarketParams[] memory markets) {
        require(markets.length > 0 && markets.length <= 4 && address(exchange).code.length > 0, "config");
        morpho = core;
        usdc = loan;
        swap = exchange;
        for (uint256 i; i < markets.length; ++i) {
            MarketParams memory mp = markets[i];
            require(
                mp.loanToken == address(loan) && mp.collateralToken != address(loan)
                    && core.market(mp.id()).lastUpdate != 0 && core.isIrmEnabled(mp.irm) && core.isLltvEnabled(mp.lltv),
                "market"
            );
            supported[Id.unwrap(mp.id())] = true;
        }
    }

    function repayWithCollateral(RepayRequest calldata r)
        external
        returns (uint256 paid, uint256 sold, uint256 refund)
    {
        if (phase != 0) revert InvalidCallbackState();
        if (!supported[r.marketId]) revert UnsupportedMarket();
        if (block.timestamp > r.deadline) revert ExpiredRequest();
        if (
            r.collateralAssetsToSell == 0 || r.maxRepayAssets == 0 || r.minUsdcOut == 0 || r.routeData.length > 256
                || (r.repayAll && r.repayAssets != 0) || (!r.repayAll && r.repayAssets == 0)
        ) revert InvalidRequest();
        MarketParams memory mp = morpho.idToMarketParams(Id.wrap(r.marketId));
        uint256 shares;
        if (r.repayAll) {
            shares = morpho.position(Id.wrap(r.marketId), msg.sender).borrowShares;
            if (shares == 0) revert InvalidRequest();
        }
        uint256 beforeBalance = usdc.balanceOf(address(this));
        bytes memory data = abi.encode(msg.sender, ++nonce, r);
        operationHash = keccak256(data);
        phase = 1;
        (paid,) = morpho.repay(mp, r.repayAssets, shares, msg.sender, data);
        if (phase != 3) revert InvalidCallbackState();
        usdc.forceApprove(address(morpho), 0);
        refund = usdc.balanceOf(address(this)) - beforeBalance;
        if (refund != 0) usdc.safeTransfer(msg.sender, refund);
        sold = r.collateralAssetsToSell;
        delete operationHash;
        phase = 0;
        emit RepayWithCollateral(msg.sender, r.marketId, sold, paid, refund);
    }

    function onMorphoRepay(uint256 assets, bytes calldata data) external {
        if (msg.sender != address(morpho)) revert UnauthorizedCallback();
        if (phase != 1 || keccak256(data) != operationHash) revert InvalidCallbackState();
        phase = 2;
        (address user,, RepayRequest memory r) = abi.decode(data, (address, uint256, RepayRequest));
        if (assets > r.maxRepayAssets) revert MaxRepayExceeded();
        MarketParams memory mp = morpho.idToMarketParams(Id.wrap(r.marketId));
        IERC20 collateral = IERC20(mp.collateralToken);
        uint256 oldCollateral = collateral.balanceOf(address(this));
        morpho.withdrawCollateral(mp, r.collateralAssetsToSell, user, address(this));
        if (collateral.balanceOf(address(this)) - oldCollateral != r.collateralAssetsToSell) revert InvalidRequest();
        uint256 beforeBalance = usdc.balanceOf(address(this));
        collateral.forceApprove(address(swap), r.collateralAssetsToSell);
        swap.sell(mp.collateralToken, r.collateralAssetsToSell, r.minUsdcOut, r.deadline, r.routeData);
        collateral.forceApprove(address(swap), 0);
        uint256 output = usdc.balanceOf(address(this)) - beforeBalance;
        if (output < r.minUsdcOut || output < assets) revert InsufficientSwapOutput();
        if (collateral.balanceOf(address(this)) != oldCollateral) revert InvalidRequest();
        uint256 debt = morpho.expectedBorrowAssets(mp, user);
        if (debt != 0) {
            uint256 value =
                Math.mulDiv(morpho.position(Id.wrap(r.marketId), user).collateral, IOracle(mp.oracle).price(), 1e36);
            uint256 hf = Math.mulDiv(Math.mulDiv(value, mp.lltv, 1e18), 1e18, debt);
            if (hf < Math.max(1e18, r.minHealthFactorWad)) revert UnhealthyPosition();
        }
        usdc.forceApprove(address(morpho), assets);
        phase = 3;
    }
}
