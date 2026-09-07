// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {Script} from "forge-std/Script.sol";
import {IMorpho, MarketParams} from "morpho-blue/src/interfaces/IMorpho.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {StocklineOracle} from "../src/StocklineOracle.sol";
import {StocklineLens} from "../src/StocklineLens.sol";
import {StocklineRepayAdapter} from "../src/StocklineRepayAdapter.sol";
import {StocklineV3Swap, IV3Router, IV3Quoter} from "../src/StocklineV3Swap.sol";
import {NasdaqSessionGuard, ICoinbaseOracleRegistry} from "../src/NasdaqSessionGuard.sol";
import {IFeed} from "../src/interfaces/IStockline.sol";
contract DeployPilot is Script {
    function run() external {
        require(block.chainid == 8453 || block.chainid == 31337,"wrong chain");
        string memory evidence = vm.readFile("deployments/pilot-credit-evidence.json");
        require(vm.parseJsonBool(evidence,".success") && vm.parseJsonBool(evidence,".liquidation") && vm.parseJsonBool(evidence,".closedSession"),"missing fork proof");
        address admin = vm.envAddress("PILOT_DEPLOYER");
        IMorpho morpho = IMorpho(0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb);
        IERC20 usdc = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913);
        address nvda = 0xb20000000000000000000078ee7ce2fE4908108C;
        address irm = 0x46415998764C29aB2a25CbeA6254146D50D22687;
        require(morpho.isIrmEnabled(irm) && morpho.isLltvEnabled(0.77e18),"disabled risk parameters");
        string memory json = vm.readFile("config/nasdaq-pilot-calendar.json");
        uint256[] memory opens = vm.parseJsonUintArray(json,".opens");
        uint256[] memory closes = vm.parseJsonUintArray(json,".closes");
        require(opens.length == closes.length && block.timestamp < closes[closes.length-1],"expired calendar");
        NasdaqSessionGuard.Session[] memory sessions = new NasdaqSessionGuard.Session[](opens.length);
        for(uint256 i;i<opens.length;++i) sessions[i]=NasdaqSessionGuard.Session(uint64(opens[i]),uint64(closes[i]));
        vm.startBroadcast(admin);
        NasdaqSessionGuard guard = new NasdaqSessionGuard(admin,nvda,IFeed(0x04689a41629776563E6822F76f2e57D148d28513),ICoinbaseOracleRegistry(0x3f3E8cf41cdd3b1D118c16471aB0113DfDDd5CaD),sessions);
        StocklineOracle oracle = new StocklineOracle(nvda,IFeed(0x04689a41629776563E6822F76f2e57D148d28513),IFeed(0x7e860098F58bBFC8648a4311b374B1D669a2bc6B),IFeed(0xBCF85224fc0756B9Fa45aA7892530B47e10b6433),guard,8,6,86400,86400,3600);
        address[] memory tokens = new address[](1);tokens[0]=nvda;
        uint24[] memory fees = new uint24[](1);fees[0]=3000;
        StocklineV3Swap swap = new StocklineV3Swap(IV3Router(0x2626664c2603336E57B271c5C0b26F421741e481),IV3Quoter(0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a),usdc,tokens,fees);
        MarketParams[] memory markets = new MarketParams[](1);markets[0]=MarketParams(address(usdc),nvda,address(oracle),irm,0.77e18);
        morpho.createMarket(markets[0]);
        new StocklineRepayAdapter(morpho,usdc,swap,markets);
        new StocklineLens();
        vm.stopBroadcast();
    }
}
