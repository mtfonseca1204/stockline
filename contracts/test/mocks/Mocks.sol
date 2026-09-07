// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IFeed, IMarketStatus, IStocklineSwap} from "../../src/interfaces/IStockline.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract TestToken is ERC20 {
    uint8 private immutable precision;
    mapping(address => bool) public blocked;

    constructor(string memory symbol_, uint8 d) ERC20(string.concat("TEST ONLY ", symbol_), symbol_) {
        precision = d;
    }

    function decimals() public view override returns (uint8) {
        return precision;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setBlocked(address who, bool value) external {
        blocked[who] = value;
    }

    function _update(address from, address to, uint256 amount) internal override {
        require(!blocked[from] && !blocked[to] && !blocked[msg.sender], "policy blocked");
        super._update(from, to, amount);
    }
}

contract TestFeed is IFeed {
    uint8 public immutable decimals;
    int256 public answer;
    uint256 public updatedAt;
    uint256 public startedAt;

    constructor(uint8 d, int256 a) {
        decimals = d;
        set(a, block.timestamp);
        startedAt = 1;
    }

    function set(int256 a, uint256 t) public {
        answer = a;
        updatedAt = t;
    }

    function setStarted(uint256 t) external {
        startedAt = t;
    }

    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
        return (1, answer, startedAt, updatedAt, 1);
    }
}

contract TestStatus is IMarketStatus {
    bool public valid = true;

    function set(bool v) external {
        valid = v;
    }

    function isValid(address) external view returns (bool) {
        return valid;
    }
}

/// Local exchange with separately funded USDC reserves and an independent execution price.
contract TestSwap is IStocklineSwap {
    IERC20 public immutable usdc;
    mapping(address => uint256) public price;
    address public attackTarget;
    bytes public attackData;

    constructor(IERC20 loan) {
        usdc = loan;
    }

    function setPrice(address token, uint256 p) external {
        price[token] = p;
    }

    function attack(address target, bytes calldata data) external {
        attackTarget = target;
        attackData = data;
    }

    function quote(address token, uint256 amount) public view returns (uint256) {
        return Math.mulDiv(amount, price[token], 1e36);
    }

    function sell(address token, uint256 amount, uint256 minimum, uint256 deadline, bytes calldata route)
        external
        returns (uint256 out)
    {
        require(deadline >= block.timestamp && route.length == 0, "route/deadline");
        if (attackTarget != address(0)) {
            (bool ok,) = attackTarget.call(attackData);
            require(ok, "attack rejected");
        }
        out = quote(token, amount);
        require(out >= minimum, "slippage");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "input");
        require(usdc.transfer(msg.sender, out), "output");
    }
}
