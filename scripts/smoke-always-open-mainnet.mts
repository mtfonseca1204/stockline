import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  erc20Abi,
  type Address,
  type Abi,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
const output = "contracts/deployments/always-open-mainnet-smoke.json";
if (existsSync(output))
  throw Error("Existing smoke progress: reconcile, do not repeat");
const d = JSON.parse(readFileSync("contracts/deployments/8453.json", "utf8"));
if (!d.alwaysOpen) throw Error("Wrong deployment");
const rl = createInterface({ input: process.stdin, terminal: false });
const key = await new Promise<string>((r) =>
  rl.once("line", (line) => {
    rl.close();
    r(line.trim());
  }),
);
const account = privateKeyToAccount(key as Hex);
if (
  account.address.toLowerCase() !== "0xc06394f634464e8198c1aea035ce663887c7ca4c"
)
  throw Error("Wrong signer");
const c = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});
const w = createWalletClient({
  chain: base,
  account,
  transport: http("https://mainnet.base.org"),
});
const m = d.markets[0];
const mp = {
  loanToken: m.loanToken,
  collateralToken: m.collateralToken,
  oracle: m.oracle,
  irm: m.irm,
  lltv: BigInt(m.lltv),
};
const core = JSON.parse(
  readFileSync("src/lib/chain/generated/Morpho.json", "utf8"),
) as Abi;
const report: {
  success: boolean;
  marketId: string;
  transactions: object[];
  borrowedUsdc: string;
  stockSpendUsdc: string;
  finalPosition?: unknown;
} = {
  success: false,
  marketId: m.marketId,
  transactions: [],
  borrowedUsdc: "0.02",
  stockSpendUsdc: "0.10",
};
const save = () =>
  writeFileSync(
    output,
    JSON.stringify(
      report,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ) + "\n",
  );
let blockNumber: bigint | undefined;
async function send(
  label: string,
  address: Address,
  abi: Abi,
  functionName: string,
  args: readonly unknown[],
) {
  const fees = await c.estimateFeesPerGas();
  if (fees.maxFeePerGas > 100000000n) throw Error("Fee cap exceeded");
  const sim = await c.simulateContract({
    address,
    abi,
    functionName,
    args,
    account,
    blockNumber,
  });
  const hash = await w.writeContract({
    ...sim.request,
    gas: 1000000n,
    ...fees,
  });
  const tx = { label, hash, status: "pending", blockNumber: 0n };
  report.transactions.push(tx);
  save();
  const receipt = await c.waitForTransactionReceipt({ hash, confirmations: 2 });
  tx.status = receipt.status;
  tx.blockNumber = receipt.blockNumber;
  save();
  if (receipt.status !== "success") throw Error(label + " reverted");
  blockNumber = receipt.blockNumber;
  console.log(label + ": confirmed " + hash);
}
const position = () =>
  c.readContract({
    address: d.morpho,
    abi: core,
    functionName: "position",
    args: [m.marketId, account.address],
  }) as Promise<readonly bigint[]>;
const before = await position();
if (before[1] || before[2]) throw Error("Existing borrower position");
const balance = () =>
  c.readContract({
    address: m.collateralToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });
const oldBalance = await balance();
const router = "0x2626664c2603336E57B271c5C0b26F421741e481";
const q = await c.simulateContract({
  address: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
  abi: parseAbi([
    "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) returns(uint256,uint160,uint32,uint256)",
  ]),
  functionName: "quoteExactInputSingle",
  args: [
    {
      tokenIn: d.usdc,
      tokenOut: m.collateralToken,
      amountIn: 100000n,
      fee: 3000,
      sqrtPriceLimitX96: 0n,
    },
  ],
});
await send("Approve stock purchase", d.usdc, erc20Abi, "approve", [
  router,
  100000n,
]);
await send(
  "Buy NVDAc for 0.10 USDC",
  router,
  parseAbi([
    "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns(uint256)",
  ]),
  "exactInputSingle",
  [
    {
      tokenIn: d.usdc,
      tokenOut: m.collateralToken,
      fee: 3000,
      recipient: account.address,
      amountIn: 100000n,
      amountOutMinimum: (q.result[0] * 995n) / 1000n,
      sqrtPriceLimitX96: 0n,
    },
  ],
);
const bought = (await balance()) - oldBalance;
if (bought <= 0n) throw Error("No stock received");
await send("Approve collateral", m.collateralToken, erc20Abi, "approve", [
  d.morpho,
  bought,
]);
await send("Deposit real NVDAc", d.morpho, core, "supplyCollateral", [
  mp,
  bought,
  account.address,
  "0x",
]);
await send("Borrow outside market hours", d.morpho, core, "borrow", [
  mp,
  20000n,
  0n,
  account.address,
  account.address,
]);
await send("Approve repayment", d.usdc, erc20Abi, "approve", [
  d.morpho,
  21000n,
]);
const debt = await position();
await send("Repay all shares", d.morpho, core, "repay", [
  mp,
  0n,
  debt[1],
  account.address,
  "0x",
]);
await send("Withdraw real NVDAc", d.morpho, core, "withdrawCollateral", [
  mp,
  bought,
  account.address,
  account.address,
]);
report.finalPosition = await position();
if (
  (report.finalPosition as bigint[])[1] ||
  (report.finalPosition as bigint[])[2]
)
  throw Error("Position not closed");
report.success = true;
save();
console.log(
  "Live off-hours cycle completed; stock returned to deployer wallet.",
);
