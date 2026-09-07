// Signs the reviewed dry-run plan in memory. Secret arrives via stdin, never argv/files/logs.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { execFileSync } from "node:child_process";
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  encodeAbiParameters,
  erc20Abi,
  type Hex,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
execFileSync("npx", ["tsx", "scripts/check-release.mts"], { stdio: "inherit" });
const output = "contracts/deployments/8453-pilot-progress.json";
if (existsSync(output))
  throw Error(
    "Deployment progress exists. Reconcile receipts before any retry.",
  );
const plan = JSON.parse(
  readFileSync(
    "contracts/broadcast/DeployPilot.s.sol/8453/dry-run/run-latest.json",
    "utf8",
  ),
);
const expected = [
  "NasdaqSessionGuard",
  "StocklineOracle",
  "StocklineV3Swap",
  null,
  "StocklineRepayAdapter",
  "StocklineLens",
];
if (
  plan.transactions.length !== 6 ||
  plan.transactions.some((t: { contractName: string | null }, i: number) => t.contractName !== expected[i])
)
  throw Error("Unexpected deployment plan");
const c = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org", { timeout: 60000 }),
});
if ((await c.getChainId()) !== 8453) throw Error("Wrong chain");
const rl = createInterface({ input: process.stdin, terminal: false });
const key = await new Promise<string>((resolve) =>
  rl.once("line", (line) => {
    rl.close();
    resolve(line.trim());
  }),
);
const account = privateKeyToAccount(key as Hex);
if (
  account.address.toLowerCase() !== "0xc06394f634464e8198c1aea035ce663887c7ca4c"
)
  throw Error("Wrong signer");
const w = createWalletClient({
  account,
  chain: base,
  transport: http("https://mainnet.base.org", { timeout: 60000 }),
});
const config = JSON.parse(
  readFileSync("contracts/config/base-fork.json", "utf8"),
);
if (
  (await c.getTransactionCount({
    address: account.address,
    blockTag: "pending",
  })) !== Number(BigInt(plan.transactions[0].transaction.nonce))
)
  throw Error("Nonce changed since dry run");
const progress: {chainId: number; complete: boolean; transactions: {label: string; hash: Hex; status: string; blockNumber?: bigint; gasUsed?: bigint}[]} = { chainId: 8453, transactions: [], complete: false };
const save = () =>
  writeFileSync(
    output,
    JSON.stringify(
      progress,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ) + "\n",
  );
async function receipt(label: string, hash: Hex) {
  progress.transactions.push({ label, hash, status: "pending" });
  save();
  const r = await c.waitForTransactionReceipt({ hash, confirmations: 2 });
  Object.assign(progress.transactions.at(-1), {
    status: r.status,
    blockNumber: r.blockNumber,
    gasUsed: r.gasUsed,
  });
  save();
  if (r.status !== "success") throw Error(`${label} reverted`);
  console.log(`${label}: confirmed ${hash}`);
  return r;
}
for (const t of plan.transactions) {
  const tx = t.transaction;
  if (
    tx.from.toLowerCase() !== account.address.toLowerCase() ||
    BigInt(tx.value) !== 0n ||
    Number(tx.chainId) !== 8453
  )
    throw Error("Plan mismatch");
  const fees = await c.estimateFeesPerGas();
  if (fees.maxFeePerGas > 100000000n) throw Error("Gas exceeds pilot cap");
  const hash = await w.sendTransaction({
    to: tx.to ?? undefined,
    data: tx.input,
    value: 0n,
    nonce: Number(BigInt(tx.nonce)),
    gas: BigInt(tx.gas),
    ...fees,
  });
  const r = await receipt(t.contractName ?? "Create NVDAc market", hash);
  if (
    t.transactionType === "CREATE" &&
    r.contractAddress?.toLowerCase() !== t.contractAddress.toLowerCase()
  )
    throw Error("Unexpected deployed address");
}
const address = (name: string) =>
  plan.transactions.find((t: {contractName: string | null; contractAddress: Address}) => t.contractName === name)
    .contractAddress as Address;
const mp = {
  loanToken: config.usdc,
  collateralToken: config.markets[0].token,
  oracle: address("StocklineOracle"),
  irm: config.irm,
  lltv: 770000000000000000n,
};
const core = JSON.parse(
  readFileSync("contracts/out/Morpho.sol/Morpho.json", "utf8"),
).abi;
const balance = await c.readContract({
  address: config.usdc,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [account.address],
});
if (balance < 98000000n) throw Error("USDC seed not available");
for (const [label, contract, abi, fn, args] of [
  [
    "Approve 98 USDC",
    config.usdc,
    erc20Abi,
    "approve",
    [config.morpho, 98000000n],
  ],
  [
    "Supply 98 USDC",
    config.morpho,
    core,
    "supply",
    [mp, 98000000n, 0n, account.address, "0x"],
  ],
] as const) {
  const sim = await c.simulateContract({
    address: contract,
    abi,
    functionName: fn,
    args,
    account,
  });
  await receipt(label, await w.writeContract(sim.request));
}
const id = keccak256(
  encodeAbiParameters(
    [
      { type: "address" },
      { type: "address" },
      { type: "address" },
      { type: "address" },
      { type: "uint256" },
    ],
    [mp.loanToken, mp.collateralToken, mp.oracle, mp.irm, mp.lltv],
  ),
);
const market = await c.readContract({
  address: config.morpho,
  abi: core,
  functionName: "market",
  args: [id],
});
if (market[0] !== 98000000n) throw Error("Unexpected seeded liquidity");
const manifest = {
  schemaVersion: 1,
  chainId: 8453,
  mode: "base-mainnet-pilot",
  productionReady: false,
  pilot: true,
  morpho: config.morpho,
  usdc: config.usdc,
  adapter: address("StocklineRepayAdapter"),
  lens: address("StocklineLens"),
  swap: address("StocklineV3Swap"),
  guard: address("NasdaqSessionGuard"),
  indexFromBlock: Number(progress.transactions[0].blockNumber),
  calendarValidThrough: "2026-12-31",
  oraclePolicy:
    "Nasdaq regular sessions, official calendar, emergency admin pause, current-session price, 24h heartbeat, 1h sequencer recovery",
  markets: [
    {
      ...mp,
      ticker: "NVDAc",
      enabled: true,
      marketId: id,
      feed: config.markets[0].feed,
      collateralDecimals: 8,
      loanDecimals: 6,
      uiMaxLtvWad: "500000000000000000",
    },
  ],
  transactions: progress.transactions,
  artifactHashes: JSON.parse(
    readFileSync("contracts/deployments/pilot-credit-evidence.json", "utf8"),
  ).artifactHashes,
};
const encoded =
  JSON.stringify(
    manifest,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  ) + "\n";
writeFileSync("contracts/deployments/8453.json", encoded);
writeFileSync("src/lib/chain/generated/base.json", encoded);
progress.complete = true;
save();
console.log(
  "Pilot deployed and seeded. Nasdaq session restrictions remain enforced.",
);
