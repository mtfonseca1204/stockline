// Genuine local native-precompile smoke; never uses a mainnet RPC or key.
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  encodeAbiParameters,
  keccak256,
  stringToHex,
  type Abi,
  type Address,
  type Hex,
} from "viem";
import { anvil } from "viem/chains";
import { readFileSync, writeFileSync } from "node:fs";
const url = "http://127.0.0.1:8548";
const client = createPublicClient({ chain: anvil, transport: http(url) });
const accounts = await client.request({ method: "eth_accounts" });
if ((await client.getChainId()) !== 31337) throw new Error("local only");
const wallet = createWalletClient({
  chain: anvil,
  account: accounts[0],
  transport: http(url),
});
const factory = "0xB20f000000000000000000000000000000000000";
const activation = "0x8453000000000000000000000000000000000001";
const activationAbi = parseAbi([
  "function admin() view returns(address)",
  "function activate(bytes32)",
  "error AlreadyActivated(bytes32)",
]);
const factoryAbi = parseAbi([
  "function createB20(uint8,bytes32,bytes,bytes[]) returns(address)",
]);
const txs: Hex[] = [];
async function send(
  address: Address,
  abi: Abi,
  functionName: string,
  args: readonly unknown[],
  account = accounts[0],
) {
  const hash = await wallet.writeContract({
    address,
    abi,
    functionName,
    args,
    account,
    gas: 8000000n,
  });
  const r = await client.waitForTransactionReceipt({ hash });
  if (r.status !== "success") throw new Error(`reverted ${hash}`);
  txs.push(hash);
  return r;
}
const artifact = (file: string, name: string) =>
  JSON.parse(readFileSync(`contracts/out/${file}.sol/${name}.json`, "utf8"));
async function deploy(file: string, name: string, args: readonly unknown[]) {
  const a = artifact(file, name);
  const hash = await wallet.deployContract({
    abi: a.abi,
    bytecode: a.bytecode.object,
    args,
    gas: 12000000n,
  });
  const r = await client.waitForTransactionReceipt({ hash });
  if (r.status !== "success" || !r.contractAddress)
    throw new Error(`deploy ${name} failed`);
  txs.push(hash);
  return r.contractAddress;
}
const report: {
  backend: string;
  success: boolean;
  transactions: Hex[];
  error?: string;
  token?: Address;
} = {
  backend: "base-anvil native RPC 8548; no Solidity etch",
  success: false,
  transactions: txs,
};
try {
  const admin = await client.readContract({
    address: activation,
    abi: activationAbi,
    functionName: "admin",
  });
  for (const name of ["base.b20_asset", "base.policy_registry"]) {
    const feature = keccak256(stringToHex(name));
    try {
      await client.simulateContract({
        address: activation,
        abi: activationAbi,
        functionName: "activate",
        args: [feature],
        account: admin,
      });
      await send(activation, activationAbi, "activate", [feature], admin);
    } catch (e) {
      if (!String(e).includes("AlreadyActivated")) throw e;
    }
  }
  const params = encodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          { type: "uint8", name: "version" },
          { type: "string", name: "name" },
          { type: "string", name: "symbol" },
          { type: "address", name: "initialAdmin" },
          { type: "uint8", name: "decimals" },
        ],
      },
    ],
    [
      {
        version: 1,
        name: "Stockline native TEST",
        symbol: "tSTOCK",
        initialAdmin: accounts[0],
        decimals: 8,
      },
    ],
  );
  const args = [
    0,
    keccak256(stringToHex(`stockline-native-${Date.now()}`)),
    params,
    [],
  ] as const;
  const token = await client.readContract({
    address: factory,
    abi: factoryAbi,
    functionName: "createB20",
    args,
    account: accounts[0],
  });
  await send(factory, factoryAbi, "createB20", args);
  report.token = token;
  const b20Abi = parseAbi([
    "function grantRole(bytes32,address)",
    "function mint(address,uint256)",
    "function approve(address,uint256) returns(bool)",
    "function balanceOf(address) view returns(uint256)",
  ]);
  await send(token, b20Abi, "grantRole", [
    keccak256(stringToHex("MINT_ROLE")),
    accounts[0],
  ]);
  await send(token, b20Abi, "mint", [accounts[1], 10000000000n]);
  const morpho = await deploy("Morpho", "Morpho", [accounts[0]]);
  const irm = await deploy("AdaptiveCurveIrm", "AdaptiveCurveIrm", [morpho]);
  const coreAbi = artifact("Morpho", "Morpho").abi;
  await send(morpho, coreAbi, "enableIrm", [irm]);
  await send(morpho, coreAbi, "enableLltv", [800000000000000000n]);
  const loan = await deploy("Mocks", "TestToken", ["tUSDC", 6]);
  const feed = await deploy("Mocks", "TestFeed", [8, 10000000000n]);
  const usd = await deploy("Mocks", "TestFeed", [8, 100000000n]);
  const seq = await deploy("Mocks", "TestFeed", [0, 0]);
  const status = await deploy("Mocks", "TestStatus", []);
  const oracle = await deploy("StocklineOracle", "StocklineOracle", [
    token,
    feed,
    usd,
    seq,
    status,
    8,
    6,
    172800,
    172800,
    3600,
  ]);
  const mp = {
    loanToken: loan,
    collateralToken: token,
    oracle,
    irm,
    lltv: 800000000000000000n,
  };
  await send(morpho, coreAbi, "createMarket", [mp]);
  await send(loan, b20Abi, "mint", [accounts[0], 10000000000n]);
  await send(loan, b20Abi, "approve", [morpho, 10000000000n]);
  await send(morpho, coreAbi, "supply", [
    mp,
    10000000000n,
    0n,
    accounts[0],
    "0x",
  ]);
  await send(token, b20Abi, "approve", [morpho, 1000000000n], accounts[1]);
  await send(
    morpho,
    coreAbi,
    "supplyCollateral",
    [mp, 1000000000n, accounts[1], "0x"],
    accounts[1],
  );
  await send(
    morpho,
    coreAbi,
    "borrow",
    [mp, 100000000n, 0n, accounts[1], accounts[1]],
    accounts[1],
  );
  const exchange = await deploy("Mocks", "TestSwap", [loan]);
  await send(loan, b20Abi, "mint", [exchange, 10000000000n]);
  const swapAbi = artifact("Mocks", "TestSwap").abi;
  await send(exchange, swapAbi, "setPrice", [token, 100n * 10n ** 34n]);
  const adapter = await deploy(
    "StocklineRepayAdapter",
    "StocklineRepayAdapter",
    [morpho, loan, exchange, [mp]],
  );
  await send(morpho, coreAbi, "setAuthorization", [adapter, true], accounts[1]);
  const marketId = keccak256(
    encodeAbiParameters(
      [
        { type: "address" },
        { type: "address" },
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
      ],
      [loan, token, oracle, irm, mp.lltv],
    ),
  );
  const now = (await client.getBlock()).timestamp;
  await send(
    adapter,
    artifact("StocklineRepayAdapter", "StocklineRepayAdapter").abi,
    "repayWithCollateral",
    [
      {
        marketId,
        repayAssets: 50000000n,
        repayAll: false,
        maxRepayAssets: 51000000n,
        collateralAssetsToSell: 200000000n,
        minUsdcOut: 50000000n,
        minHealthFactorWad: 1100000000000000000n,
        deadline: now + 300n,
        routeData: "0x",
      },
    ],
    accounts[1],
  );
  const positionAbi = parseAbi([
    "function position(bytes32,address) view returns(uint256,uint128,uint128)",
  ]);
  const position = await client.readContract({
    address: morpho,
    abi: positionAbi,
    functionName: "position",
    args: [marketId, accounts[1]],
  });
  await send(loan, b20Abi, "approve", [morpho, 1000000000n], accounts[1]);
  await send(
    morpho,
    coreAbi,
    "repay",
    [mp, 0n, position[1], accounts[1], "0x"],
    accounts[1],
  );
  await send(
    morpho,
    coreAbi,
    "withdrawCollateral",
    [mp, position[2], accounts[1], accounts[1]],
    accounts[1],
  );
  const final = await client.readContract({
    address: morpho,
    abi: positionAbi,
    functionName: "position",
    args: [marketId, accounts[1]],
  });
  if (final[1] !== 0n || final[2] !== 0n)
    throw new Error("Position did not close");
  const held = await client.readContract({
    address: token,
    abi: b20Abi,
    functionName: "balanceOf",
    args: [accounts[1]],
  });
  if (held !== 9800000000n)
    throw new Error("Incorrect remaining native token balance");
  report.success = true;
} catch (e) {
  report.error = e instanceof Error ? e.message : String(e);
}
writeFileSync(
  "contracts/deployments/native-b20-smoke.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    success: report.success,
    error: report.error,
    transactions: txs.length,
  }),
);
if (!report.success) process.exitCode = 1;
