// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {Script} from "forge-std/Script.sol";
import {IMorpho, MarketParams, Id} from "morpho-blue/src/interfaces/IMorpho.sol";
import {MarketParamsLib} from "morpho-blue/src/libraries/MarketParamsLib.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {StocklineOracle} from "../src/StocklineOracle.sol";
import {StocklineLens} from "../src/StocklineLens.sol";
import {StocklineRepayAdapter} from "../src/StocklineRepayAdapter.sol";
import {TestToken, TestFeed, TestStatus, TestSwap} from "../test/mocks/Mocks.sol";

contract DeployLocal is Script {
    using MarketParamsLib for MarketParams;

    function deploy(string memory artifact, bytes memory args) internal returns (address target) {
        bytes memory code = abi.encodePacked(vm.getCode(artifact), args);
        assembly ("memory-safe") { target := create(0, add(code, 32), mload(code)) }
        require(target != address(0), "deployment failed");
    }

    function run() external {
        require(block.chainid == 31337, "local only");
        address deployer = vm.envAddress("DEPLOYER");
        address borrower = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        address lender = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        uint256 startBlock = block.number;
        vm.startBroadcast(deployer);
        IMorpho core = IMorpho(deploy("Morpho.sol:Morpho", abi.encode(deployer)));
        address irm = deploy("AdaptiveCurveIrm.sol:AdaptiveCurveIrm", abi.encode(address(core)));
        core.enableIrm(irm);
        core.enableLltv(0.8e18);
        TestToken usdc = new TestToken("tUSDC", 6);
        TestFeed usd = new TestFeed(8, 1e8);
        TestFeed sequencer = new TestFeed(0, 0);
        TestStatus guard = new TestStatus();
        TestSwap swap = new TestSwap(IERC20(address(usdc)));
        StocklineLens lens = new StocklineLens();
        usdc.mint(deployer, 400_000e6);
        usdc.mint(borrower, 1000e6);
        usdc.mint(address(swap), 100_000e6);
        usdc.approve(address(core), 400_000e6);
        string[4] memory tickers = [string("NVDAc"), "AAPLc", "MSFTc", "METAc"];
        MarketParams[] memory markets = new MarketParams[](4);
        string memory entries = "[";
        for (uint256 i; i < 4; ++i) {
            TestToken token = new TestToken(string.concat("t", tickers[i]), 8);
            TestFeed feed = new TestFeed(8, int256((100 + i * 50) * 1e8));
            StocklineOracle oracle =
                new StocklineOracle(address(token), feed, usd, sequencer, guard, 8, 6, 2 days, 2 days, 1 hours);
            markets[i] = MarketParams(address(usdc), address(token), address(oracle), irm, 0.8e18);
            core.createMarket(markets[i]);
            core.supply(markets[i], 100_000e6, 0, lender, "");
            token.mint(borrower, 100e8);
            token.mint(deployer, 100e8);
            swap.setPrice(address(token), oracle.price());
            string memory key = tickers[i];
            vm.serializeString(key, "ticker", tickers[i]);
            vm.serializeBool(key, "enabled", true);
            vm.serializeAddress(key, "collateralToken", address(token));
            vm.serializeUint(key, "collateralDecimals", 8);
            vm.serializeAddress(key, "loanToken", address(usdc));
            vm.serializeUint(key, "loanDecimals", 6);
            vm.serializeAddress(key, "oracle", address(oracle));
            vm.serializeAddress(key, "feed", address(feed));
            vm.serializeAddress(key, "irm", irm);
            vm.serializeString(key, "lltv", "800000000000000000");
            vm.serializeString(key, "uiMaxLtvWad", "500000000000000000");
            string memory item = vm.serializeBytes32(key, "marketId", Id.unwrap(markets[i].id()));
            if (i != 0) entries = string.concat(entries, ",");
            entries = string.concat(entries, item);
        }
        StocklineRepayAdapter adapter = new StocklineRepayAdapter(core, IERC20(address(usdc)), swap, markets);
        vm.stopBroadcast();
        string memory key = "deployment";
        vm.serializeUint(key, "schemaVersion", 1);
        vm.serializeUint(key, "chainId", 31337);
        vm.serializeString(key, "mode", "local-test-tokens");
        vm.serializeBool(key, "productionReady", false);
        vm.serializeAddress(key, "morpho", address(core));
        vm.serializeAddress(key, "usdc", address(usdc));
        vm.serializeAddress(key, "lens", address(lens));
        vm.serializeAddress(key, "adapter", address(adapter));
        vm.serializeAddress(key, "swap", address(swap));
        vm.serializeAddress(key, "status", address(guard));
        vm.serializeAddress(key, "usdFeed", address(usd));
        vm.serializeAddress(key, "sequencer", address(sequencer));
        vm.serializeUint(key, "indexFromBlock", startBlock);
        vm.serializeAddress(key, "borrower", borrower);
        vm.serializeAddress(key, "lender", lender);
        string memory json = vm.serializeString(key, "marketsPlaceholder", "replace");
        vm.writeJson(json, "deployments/31337.json");
        vm.writeJson(string.concat(entries, "]"), "deployments/31337.json", ".markets");
    }
}
