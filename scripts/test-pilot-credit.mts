import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  erc20Abi,
  encodeAbiParameters,
  keccak256,
  type Address,
  type Abi,
} from "viem";
import { anvil } from "viem/chains";
import { readFileSync, writeFileSync } from "node:fs";
const rpc = http("http://127.0.0.1:8547", { timeout: 60000 });
const c = createPublicClient({ chain: anvil, transport: rpc });
const node = (await c.request({ method: "anvil_nodeInfo" as never })) as { network: string; forkConfig: { forkBlockNumber: number } };
if (
  (await c.getChainId()) !== 31337 ||
  node.network !== "base" ||
  node.forkConfig.forkBlockNumber !== 50877884
)
  throw Error("Wrong native historical fork");
const a = await c.request({ method: "eth_accounts" });
const w = createWalletClient({ chain: anvil, account: a[0], transport: rpc });
const d = JSON.parse(readFileSync("contracts/config/base-fork.json", "utf8"));
const nvda = d.markets[0];
const cal = JSON.parse(
  readFileSync("contracts/config/nasdaq-pilot-calendar.json", "utf8"),
);
const txs: object[] = [];
const artifactHashes = Object.fromEntries(
  [
    "NasdaqSessionGuard",
    "StocklineOracle",
    "StocklineV3Swap",
    "StocklineRepayAdapter",
    "StocklineLens",
  ].map((name) => [
    name,
    keccak256(
      JSON.parse(readFileSync(`contracts/out/${name}.sol/${name}.json`, "utf8"))
        .bytecode.object,
    ),
  ]),
);
const report: Record<string, unknown> = {
  artifactHashes,
  calendarSource: cal.source,
  calendarSessions: cal.sessions,
  forkBlock: 50877884,
  forkHash: (await c.getBlock({ blockNumber: 50877884n })).hash,
  success: false,
  fixtures: [
    "Local ETH funding only",
    "Historical fork at open session",
    "One hour time advance for interest/liquidation; feeds never modified",
  ],
  transactions: txs,
};
const art = (name: string) =>
  JSON.parse(readFileSync(`contracts/out/${name}.sol/${name}.json`, "utf8"));
async function send(
  label: string,
  address: Address,
  abi: Abi,
  fn: string,
  args: readonly unknown[] = [],
  account = a[0],
  value = 0n,
) {
  const sim = await c.simulateContract({
    address,
    abi,
    functionName: fn,
    args,
    account,
    value,
  });
  const hash = await w.writeContract({ ...sim.request, gas: 8000000n });
  const receipt = await c.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw Error(`${label} failed`);
  txs.push({ label, hash, gasUsed: receipt.gasUsed });
  return receipt;
}
async function deploy(name: string, args: unknown[]) {
  const f = art(name);
  const hash = await w.deployContract({
    abi: f.abi,
    bytecode: f.bytecode.object,
    args,
    gas: 15000000n,
  });
  const r = await c.waitForTransactionReceipt({ hash });
  if (r.status !== "success" || !r.contractAddress)
    throw Error(`${name} failed`);
  txs.push({ label: `Deploy ${name}`, hash, gasUsed: r.gasUsed });
  return r.contractAddress;
}
const router = "0x2626664c2603336E57B271c5C0b26F421741e481";
const quoter = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
const weth = "0x4200000000000000000000000000000000000006";
const qab = parseAbi([
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) returns(uint256,uint160,uint32,uint256)",
]);
const rab = parseAbi([
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns(uint256)",
]);
async function buy(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  fee: number,
) {
  const q = (
    await c.simulateContract({
      address: quoter,
      abi: qab,
      functionName: "quoteExactInputSingle",
      args: [{ tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96: 0n }],
    })
  ).result[0];
  await send("Approve swap", tokenIn, erc20Abi, "approve", [router, amountIn]);
  await send("Buy real token", router, rab, "exactInputSingle", [
    {
      tokenIn,
      tokenOut,
      fee,
      recipient: a[0],
      amountIn,
      amountOutMinimum: (q * 995n) / 1000n,
      sqrtPriceLimitX96: 0n,
    },
  ]);
}
const bal = (token: Address, owner: Address) =>
  c.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner],
  });
try {
  await send(
    "Wrap ETH",
    weth,
    parseAbi(["function deposit() payable"]),
    "deposit",
    [],
    a[0],
    10n ** 18n,
  );
  await buy(weth, d.usdc, 10n ** 18n, 500);
  await buy(d.usdc, nvda.token, 50_000000n, 3000);
  const bought = await bal(nvda.token, a[0]);
  await send("Fund borrower collateral", nvda.token, erc20Abi, "transfer", [
    a[1],
    bought,
  ]);
  await send("Fund liquidator USDC", d.usdc, erc20Abi, "transfer", [
    a[2],
    20_000000n,
  ]);
  const guard = await deploy("NasdaqSessionGuard", [
    a[0],
    nvda.token,
    nvda.feed,
    d.registry,
    cal.sessions.map(({ open, close }: { open: number; close: number }) => ({ open, close })),
  ]);
  const oracle = await deploy("StocklineOracle", [
    nvda.token,
    nvda.feed,
    d.usdcFeed,
    d.sequencerFeed,
    guard,
    8,
    6,
    86400,
    86400,
    3600,
  ]);
  const price = (await c.readContract({
    address: oracle,
    abi: art("StocklineOracle").abi,
    functionName: "price",
  })) as bigint;
  report.price = price;
  report.guard = guard;
  report.oracle = oracle;
  const mp = {
    loanToken: d.usdc,
    collateralToken: nvda.token,
    oracle,
    irm: d.irm,
    lltv: 770000000000000000n,
  };
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
  const core = art("Morpho").abi;
  await send("Create market in real Morpho", d.morpho, core, "createMarket", [
    mp,
  ]);
  const swap = await deploy("StocklineV3Swap", [
    router,
    quoter,
    d.usdc,
    [nvda.token],
    [3000],
  ]);
  const adapter = await deploy("StocklineRepayAdapter", [
    d.morpho,
    d.usdc,
    swap,
    [mp],
  ]);
  const lens = await deploy("StocklineLens", []);
  report.deployment = {
    chainId: 31337,
    mode: "base-mainnet-fork",
    productionReady: false,
    morpho: d.morpho,
    usdc: d.usdc,
    lens,
    adapter,
    swap,
    guard,
    indexFromBlock: 50877885,
    markets: [
      {
        ...mp,
        ticker: "NVDAc",
        enabled: true,
        marketId: id,
        collateralDecimals: 8,
        loanDecimals: 6,
        feed: nvda.feed,
        uiMaxLtvWad: "500000000000000000",
      },
    ],
  };
  await send("Approve lender", d.usdc, erc20Abi, "approve", [
    d.morpho,
    98_000000n,
  ]);
  await send("Supply 98 USDC", d.morpho, core, "supply", [
    mp,
    98_000000n,
    0n,
    a[0],
    "0x",
  ]);
  await send(
    "Approve borrower collateral",
    nvda.token,
    erc20Abi,
    "approve",
    [d.morpho, bought],
    a[1],
  );
  await send(
    "Deposit NVDAc",
    d.morpho,
    core,
    "supplyCollateral",
    [mp, bought, a[1], "0x"],
    a[1],
  );
  await send(
    "Borrow 10 USDC",
    d.morpho,
    core,
    "borrow",
    [mp, 10_000000n, 0n, a[1], a[1]],
    a[1],
  );
  await send(
    "Authorize adapter",
    d.morpho,
    core,
    "setAuthorization",
    [adapter, true],
    a[1],
  );
  if ((await bal(d.usdc, adapter)) !== 0n)
    throw Error("Adapter must start empty");
  const sale = 3000000n;
  const output = (
    await c.simulateContract({
      address: swap,
      abi: art("StocklineV3Swap").abi,
      functionName: "quote",
      args: [nvda.token, sale],
    })
  ).result as bigint;
  await send(
    "Repay by real Uniswap sale",
    adapter,
    art("StocklineRepayAdapter").abi,
    "repayWithCollateral",
    [
      {
        marketId: id,
        repayAssets: 5_000000n,
        repayAll: false,
        maxRepayAssets: 5_000000n,
        collateralAssetsToSell: sale,
        minUsdcOut: (output * 995n) / 1000n,
        minHealthFactorWad: 1100000000000000000n,
        deadline: (await c.getBlock()).timestamp + 300n,
        routeData: "0x",
      },
    ],
    a[1],
  );
  const position = () =>
    c.readContract({
      address: d.morpho,
      abi: core,
      functionName: "position",
      args: [id, a[1]],
    }) as Promise<[bigint, bigint, bigint]>;
  await send(
    "Approve USDC repayment",
    d.usdc,
    erc20Abi,
    "approve",
    [d.morpho, 2n ** 128n],
    a[1],
  );
  await send(
    "Repay remaining shares",
    d.morpho,
    core,
    "repay",
    [mp, 0n, (await position())[1], a[1], "0x"],
    a[1],
  );
  await send(
    "Withdraw all collateral",
    d.morpho,
    core,
    "withdrawCollateral",
    [mp, (await position())[2], a[1], a[1]],
    a[1],
  );
  let p = await position();
  if (p[1] !== 0n || p[2] !== 0n) throw Error("First cycle did not close");
  report.creditCycle = true;
  // Separate high-LTV scenario to exercise real interest and liquidation without price manipulation.
  const left = await bal(nvda.token, a[1]);
  await send(
    "Approve second deposit",
    nvda.token,
    erc20Abi,
    "approve",
    [d.morpho, left],
    a[1],
  );
  await send(
    "Second deposit",
    d.morpho,
    core,
    "supplyCollateral",
    [mp, left, a[1], "0x"],
    a[1],
  );
  const maxBorrow = (((left * price) / 10n ** 36n) * mp.lltv) / 10n ** 18n;
  await send(
    "Borrow at liquidation threshold",
    d.morpho,
    core,
    "borrow",
    [mp, maxBorrow, 0n, a[1], a[1]],
    a[1],
  );
  await c.request({
    method: "evm_increaseTime" as never,
    params: [3600] as never,
  });
  await c.request({ method: "evm_mine" as never });
  const snap = (await c.readContract({
    address: lens,
    abi: art("StocklineLens").abi,
    functionName: "snapshot",
    args: [d.morpho, mp, a[1], 500000000000000000n],
  })) as import("../src/lib/chain/types").Snapshot;
  if (
    !snap.oracleValid ||
    snap.healthFactorWad >= 10n ** 18n ||
    snap.debtAssetsRaw <= maxBorrow
  )
    throw Error(
      "Interest must produce real unhealthy position within valid session",
    );
  report.accruedInterest = snap.debtAssetsRaw - maxBorrow;
  await send(
    "Liquidator approval",
    d.usdc,
    erc20Abi,
    "approve",
    [d.morpho, 20_000000n],
    a[2],
  );
  const beforeLiquidation = await position();
  await send(
    "Real Morpho liquidation",
    d.morpho,
    core,
    "liquidate",
    [mp, a[1], 0n, beforeLiquidation[1] / 10n, "0x"],
    a[2],
  );
  if (
    (await bal(nvda.token, a[2])) === 0n ||
    (await position())[1] >= beforeLiquidation[1]
  )
    throw Error("Liquidation did not settle");
  report.liquidation = true;
  await send(
    "Close after liquidation",
    d.morpho,
    core,
    "repay",
    [mp, 0n, (await position())[1], a[1], "0x"],
    a[1],
  );
  await send(
    "Recover remaining stocks",
    d.morpho,
    core,
    "withdrawCollateral",
    [mp, (await position())[2], a[1], a[1]],
    a[1],
  );
  p = await position();
  if (p[1] || p[2]) throw Error("Final position not closed");
  // Real calendar closing, no synthetic feed/status mutation.
  await c.request({
    method: "evm_setNextBlockTimestamp" as never,
    params: [1788552000] as never,
  });
  await c.request({ method: "evm_mine" as never });
  let closed = false;
  try {
    await c.readContract({
      address: oracle,
      abi: art("StocklineOracle").abi,
      functionName: "price",
    });
  } catch {
    closed = true;
  }
  if (!closed) throw Error("Oracle remains open after session");
  report.closedSession = true;
  report.success = true;
} catch (e) {
  report.error = e instanceof Error ? e.message : String(e);
}
writeFileSync(
  "contracts/deployments/pilot-credit-evidence.json",
  JSON.stringify(
    report,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    success: report.success,
    transactions: txs.length,
    error: report.error,
  }),
);
if (!report.success) process.exitCode = 1;
