// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {Test} from "forge-std/Test.sol";
import {StocklineV3Swap, IV3Router, IV3Quoter} from "../src/StocklineV3Swap.sol";
import {TestToken} from "./mocks/Mocks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RouterFixture {
    address public immutable factory = address(this);
    bool public shortPay;

    function getPool(address, address, uint24) external view returns (address) {
        return address(this);
    }

    function setShort(bool value) external {
        shortPay = value;
    }

    function exactInputSingle(IV3Router.ExactInputSingleParams calldata p) external returns (uint256 out) {
        require(p.recipient == msg.sender && p.fee == 3000 && p.sqrtPriceLimitX96 == 0, "invalid args");
        IERC20(p.tokenIn).transferFrom(msg.sender, address(this), p.amountIn);
        out = shortPay ? 1 : p.amountIn;
        IERC20(p.tokenOut).transfer(p.recipient, out);
    }

    function quoteExactInputSingle(IV3Quoter.QuoteExactInputSingleParams calldata p)
        external
        pure
        returns (uint256, uint160, uint32, uint256)
    {
        return (p.amountIn, 0, 0, 100000);
    }
}

contract V3SwapTest is Test {
    TestToken input;
    TestToken output;
    RouterFixture router;
    StocklineV3Swap swap;

    function setUp() public {
        input = new TestToken("STOCK", 8);
        output = new TestToken("USDC", 6);
        router = new RouterFixture();
        address[] memory tokens = new address[](1);
        tokens[0] = address(input);
        uint24[] memory fees = new uint24[](1);
        fees[0] = 3000;
        swap = new StocklineV3Swap(
            IV3Router(address(router)), IV3Quoter(address(router)), IERC20(address(output)), tokens, fees
        );
        input.mint(address(this), 1000);
        output.mint(address(router), 1000);
        input.approve(address(swap), 1000);
    }

    function testFixedRouteAndDonationIsolation() public {
        input.mint(address(swap), 17);
        output.mint(address(swap), 23);
        assertEq(swap.quote(address(input), 100), 100);
        assertEq(swap.sell(address(input), 100, 99, block.timestamp, ""), 100);
        assertEq(input.allowance(address(swap), address(router)), 0);
        assertEq(input.balanceOf(address(swap)), 17);
        assertEq(output.balanceOf(address(swap)), 23);
    }

    function testOutputAndArbitraryRouteRevertAtomically() public {
        vm.expectRevert(StocklineV3Swap.InvalidRoute.selector);
        swap.sell(address(input), 100, 99, block.timestamp, hex"ff");
        router.setShort(true);
        vm.expectRevert(StocklineV3Swap.InvalidOutput.selector);
        swap.sell(address(input), 100, 99, block.timestamp, "");
        assertEq(input.balanceOf(address(this)), 1000);
    }
}
