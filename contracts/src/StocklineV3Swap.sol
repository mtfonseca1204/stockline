// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IStocklineSwap} from "./interfaces/IStockline.sol";

interface IV3Factory {
    function getPool(address, address, uint24) external view returns (address);
}

interface IV3Router {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    function factory() external view returns (address);
    function exactInputSingle(ExactInputSingleParams calldata) external payable returns (uint256);
}

interface IV3Quoter {
    struct QuoteExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint24 fee;
        uint160 sqrtPriceLimitX96;
    }
    function factory() external view returns (address);
    function quoteExactInputSingle(QuoteExactInputSingleParams calldata)
        external
        returns (uint256, uint160, uint32, uint256);
}

/// Direct pools only. Router, factory, quoter, loan token and fee tiers never change.
contract StocklineV3Swap is IStocklineSwap, ReentrancyGuard {
    using SafeERC20 for IERC20;
    error InvalidRoute();
    error InvalidOutput();
    error Expired();
    IV3Router public immutable router;
    IV3Quoter public immutable quoter;
    IERC20 public immutable usdc;
    mapping(address => uint24) public fees;
    mapping(address => address) public pools;

    constructor(IV3Router r, IV3Quoter q, IERC20 loan, address[] memory tokens, uint24[] memory tiers) {
        require(address(r).code.length > 0 && address(q).code.length > 0 && address(loan) != address(0), "config");
        require(tokens.length > 0 && tokens.length <= 4 && tokens.length == tiers.length, "markets");
        address factory = r.factory();
        require(factory == q.factory(), "factory mismatch");
        router = r;
        quoter = q;
        usdc = loan;
        for (uint256 i; i < tokens.length; i++) {
            if (tokens[i] == address(loan) || tokens[i] == address(0) || fees[tokens[i]] != 0 || tiers[i] == 0) {
                revert InvalidRoute();
            }
            address pool = IV3Factory(factory).getPool(tokens[i], address(loan), tiers[i]);
            if (pool == address(0)) revert InvalidRoute();
            fees[tokens[i]] = tiers[i];
            pools[tokens[i]] = pool;
        }
    }

    /// Use eth_call. QuoterV2 simulates the swap; this does not transfer user funds.
    function quote(address token, uint256 amount) external returns (uint256 output) {
        uint24 fee = fees[token];
        if (fee == 0 || amount == 0) revert InvalidRoute();
        (output,,,) =
            quoter.quoteExactInputSingle(IV3Quoter.QuoteExactInputSingleParams(token, address(usdc), amount, fee, 0));
    }

    function sell(address token, uint256 amount, uint256 minimum, uint256 deadline, bytes calldata route)
        external
        nonReentrant
        returns (uint256 output)
    {
        if (block.timestamp > deadline) revert Expired();
        uint24 fee = fees[token];
        if (fee == 0 || amount == 0 || minimum == 0 || route.length != 0) revert InvalidRoute();
        IERC20 input = IERC20(token);
        uint256 oldInput = input.balanceOf(address(this));
        uint256 oldOutput = usdc.balanceOf(address(this));
        input.safeTransferFrom(msg.sender, address(this), amount);
        if (input.balanceOf(address(this)) - oldInput != amount) revert InvalidRoute();
        input.forceApprove(address(router), amount);
        router.exactInputSingle(
            IV3Router.ExactInputSingleParams(token, address(usdc), fee, address(this), amount, minimum, 0)
        );
        input.forceApprove(address(router), 0);
        output = usdc.balanceOf(address(this)) - oldOutput;
        if (output < minimum || input.balanceOf(address(this)) != oldInput) revert InvalidOutput();
        usdc.safeTransfer(msg.sender, output);
    }
}
