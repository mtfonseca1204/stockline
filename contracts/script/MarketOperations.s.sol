// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {Script} from "forge-std/Script.sol";
import {IMorpho, MarketParams, Id} from "morpho-blue/src/interfaces/IMorpho.sol";
import {MarketParamsLib} from "morpho-blue/src/libraries/MarketParamsLib.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// Explicit parameters. Use forge --account <keystore>, never embed a key.
/// Creation must only follow the separately reviewed deployment manifest.
contract MarketOperations is Script {
    using MarketParamsLib for MarketParams;

    function params() internal view returns (IMorpho core, MarketParams memory mp) {
        require(block.chainid == vm.envUint("EXPECTED_CHAIN_ID"), "wrong chain");
        core = IMorpho(vm.envAddress("MORPHO"));
        mp = MarketParams(
            vm.envAddress("LOAN_TOKEN"),
            vm.envAddress("COLLATERAL_TOKEN"),
            vm.envAddress("ORACLE"),
            vm.envAddress("IRM"),
            vm.envUint("LLTV")
        );
        require(Id.unwrap(mp.id()) == vm.envBytes32("MARKET_ID"), "market id mismatch");
        require(core.isIrmEnabled(mp.irm) && core.isLltvEnabled(mp.lltv), "disabled params");
    }

    function createMarket() external {
        (IMorpho core, MarketParams memory mp) = params();
        require(block.chainid == 31337, "mainnet release gates unresolved");
        if (core.market(mp.id()).lastUpdate != 0) return;
        vm.startBroadcast();
        core.createMarket(mp);
        vm.stopBroadcast();
    }

    function seed() external {
        (IMorpho core, MarketParams memory mp) = params();
        require(block.chainid == 31337, "mainnet release gates unresolved");
        require(core.market(mp.id()).lastUpdate != 0, "missing market");
        uint256 amount = vm.envUint("SEED_USDC_RAW");
        require(amount > 0, "zero amount");
        address lender = vm.envAddress("LENDER");
        vm.startBroadcast();
        IERC20(mp.loanToken).approve(address(core), amount);
        core.supply(mp, amount, 0, lender, "");
        vm.stopBroadcast();
    }
}
