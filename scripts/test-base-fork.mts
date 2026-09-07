// Integration evidence against existing contracts. Writes ONLY to a verified loopback Anvil fork.
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  erc20Abi,
  type Address,
  type Abi,
  type Hex,
  keccak256,
} from "viem";
import { anvil } from "viem/chains";
import { readFileSync, writeFileSync } from "node:fs";
const url = "http://127.0.0.1:8546";
const client = createPublicClient({
  chain: anvil,
  transport: http(url, { timeout: 60000 }),
});
const node = (await client.request({
  method: "anvil_nodeInfo" as never,
})) as unknown as {
  network: string;
  forkConfig: { forkBlockNumber: number };
  environment: { chainId: number };
};
if (
  (await client.getChainId()) !== 31337 ||
  node.network !== "base" ||
  !node.forkConfig?.forkBlockNumber
)
  throw Error("Requires native Base Anvil fork on loopback:8546, chain 31337");
const baseBlock = await client.getBlock({
  blockNumber: BigInt(node.forkConfig.forkBlockNumber),
});
const accounts = await client.request({ method: "eth_accounts" });
const wallet = createWalletClient({
  account: accounts[0],
  chain: anvil,
  transport: http(url, { timeout: 60000 }),
});
const inputs = JSON.parse(
  readFileSync("contracts/config/base-fork.json", "utf8"),
);
const router = "0x2626664c2603336E57B271c5C0b26F421741e481" as Address;
const quoter = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a" as Address;
const weth = "0x4200000000000000000000000000000000000006" as Address;
const usdc = inputs.usdc as Address;
const routerAbi = parseAbi([
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns(uint256)",
]);
const quoteAbi = parseAbi([
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) returns(uint256,uint160,uint32,uint256)",
]);
const feedAbi = parseAbi([
  "function latestRoundData() view returns(uint80,int256,uint256,uint256,uint80)",
]);
const registryAbi = parseAbi([
  "function getOracleParams(address) view returns(uint256,bool)",
]);
const fees = inputs.markets.map((m: { fee: number }) => m.fee);
if (
  node.forkConfig.forkBlockNumber !== inputs.forkBlockNumber ||
  baseBlock.hash !== inputs.forkBlockHash
)
  throw Error("Fork block does not match pinned configuration");
const transactions: { step: string; hash: Hex; block: bigint }[] = [];
const report = {
  oracleDependencies: {} as Record<string, unknown>,
  coreParameters: { morpho: inputs.morpho, irm: inputs.irm, lltv: inputs.lltv },
  artifactHash: keccak256(
    JSON.parse(
      readFileSync(
        "contracts/out/StocklineV3Swap.sol/StocklineV3Swap.json",
        "utf8",
      ),
    ).bytecode.object,
  ),
  testScope:
    "Real funding, token transfers and Uniswap settlement. Full Morpho credit/adapter liquidation gate remains blocked.",
  creditIntegrationPassed: false,
  creditBlockers: [
    "Verified session source missing; no mock guard is allowed",
    "Production oracle heartbeat/recovery policy unresolved",
  ],
  schemaVersion: 1,
  mode: "base-mainnet-fork",
  productionReady: false,
  forkBlock: baseBlock.number,
  forkHash: baseBlock.hash,
  forkTimestamp: baseBlock.timestamp,
  backend: node.network,
  fixtures: [
    "Anvil account ETH only; WETH deposited normally; USDC and stocks bought in existing Uniswap pools",
  ],
  forbiddenMutations: [
    "no setCode",
    "no setStorageAt",
    "no token mint",
    "no impersonation",
    "no feed or policy overrides",
  ],
  transactions,
  markets: [] as object[],
  errors: [] as string[],
};
async function send(
  step: string,
  address: Address,
  abi: Abi,
  functionName: string,
  args: readonly unknown[] = [],
  value = 0n,
) {
  const simulation = await client.simulateContract({
    address,
    abi,
    functionName,
    args,
    account: accounts[0],
    value,
  });
  const hash = await wallet.writeContract({
    ...simulation.request,
    gas: 5000000n,
  });
  const r = await client.waitForTransactionReceipt({ hash });
  if (r.status !== "success") throw Error(`${step} reverted ${hash}`);
  transactions.push({ step, hash, block: r.blockNumber });
  return r;
}
async function balance(token: Address) {
  return client.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [accounts[0]],
  });
}
async function quote(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  fee: number,
) {
  return (
    await client.simulateContract({
      address: quoter,
      abi: quoteAbi,
      functionName: "quoteExactInputSingle",
      args: [{ tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96: 0n }],
    })
  ).result[0];
}
async function buy(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  fee: number,
  label: string,
) {
  const output = await quote(tokenIn, tokenOut, amountIn, fee);
  await send(`${label} approve`, tokenIn, erc20Abi, "approve", [
    router,
    amountIn,
  ]);
  await send(label, router, routerAbi, "exactInputSingle", [
    {
      tokenIn,
      tokenOut,
      fee,
      recipient: accounts[0],
      amountIn,
      amountOutMinimum: (output * 995n) / 1000n,
      sqrtPriceLimitX96: 0n,
    },
  ]);
}
try {
  const coreAbi = parseAbi([
    "function isIrmEnabled(address) view returns(bool)",
    "function isLltvEnabled(uint256) view returns(bool)",
  ]);
  if (
    !(await client.readContract({
      address: inputs.morpho,
      abi: coreAbi,
      functionName: "isIrmEnabled",
      args: [inputs.irm],
    }))
  )
    throw Error("Production IRM not enabled");
  if (
    !(await client.readContract({
      address: inputs.morpho,
      abi: coreAbi,
      functionName: "isLltvEnabled",
      args: [BigInt(inputs.lltv)],
    }))
  )
    throw Error("Production LLTV not enabled");
  for (const [label, address] of [
    ["USDC/USD", inputs.usdcFeed],
    ["Sequencer", inputs.sequencerFeed],
  ] as const) {
    report.oracleDependencies[label] = {
      address,
      round: await client.readContract({
        address,
        abi: feedAbi,
        functionName: "latestRoundData",
      }),
    };
  }
  await send(
    "wrap local ETH",
    weth,
    parseAbi(["function deposit() payable"]),
    "deposit",
    [],
    10n ** 18n,
  );
  await buy(weth, usdc, 10n ** 18n, 500, "buy real USDC");
  const artifact = JSON.parse(
    readFileSync(
      "contracts/out/StocklineV3Swap.sol/StocklineV3Swap.json",
      "utf8",
    ),
  );
  const hash = await wallet.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode.object,
    args: [
      router,
      quoter,
      usdc,
      inputs.markets.map((m: { token: Address }) => m.token),
      fees,
    ],
    gas: 8000000n,
  });
  const receipt = await client.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success" || !receipt.contractAddress)
    throw Error(`StocklineV3Swap deployment reverted: ${hash}`);
  const swap = receipt.contractAddress;
  transactions.push({
    step: "deploy StocklineV3Swap",
    hash,
    block: receipt.blockNumber,
  });
  for (const [i, m] of inputs.markets.entries()) {
    const evidence: Record<string, unknown> = {
      ticker: m.ticker,
      token: m.token,
      feed: m.feed,
      fee: fees[i],
      swap,
      complete: false,
    };
    try {
      const symbol = await client.readContract({
        address: m.token,
        abi: erc20Abi,
        functionName: "symbol",
      });
      const decimals = await client.readContract({
        address: m.token,
        abi: erc20Abi,
        functionName: "decimals",
      });
      if (symbol !== m.ticker || decimals !== m.decimals)
        throw Error("Native token identity mismatch");
      const round = await client.readContract({
        address: m.feed,
        abi: feedAbi,
        functionName: "latestRoundData",
      });
      const registry = await client.readContract({
        address: inputs.registry,
        abi: registryAbi,
        functionName: "getOracleParams",
        args: [m.token],
      });
      evidence.feedRound = round;
      evidence.feedAgeSeconds = (await client.getBlock()).timestamp - round[3];
      evidence.registry = { multiplier: registry[0], paused: registry[1] };
      evidence.creditBlocked =
        registry[1] ||
        BigInt(evidence.feedAgeSeconds as bigint) >
          BigInt(inputs.equityMaxAgeSeconds);
      evidence.creditBlockReason =
        "Session source not configured; no synthetic session or feed update permitted";
      const before = await balance(m.token);
      await buy(usdc, m.token, 100n * 10n ** 6n, fees[i], `buy ${m.ticker}`);
      const acquired = (await balance(m.token)) - before;
      if (acquired <= 0n) throw Error("No stock received");
      evidence.acquired = acquired;
      // Transfer through an independent user and return, exercising native policy checks.
      await send(`transfer ${m.ticker}`, m.token, erc20Abi, "transfer", [
        accounts[1],
        acquired,
      ]);
      const returned = await wallet.writeContract({
        account: accounts[1],
        address: m.token,
        abi: erc20Abi,
        functionName: "transfer",
        args: [accounts[0], acquired],
        gas: 1000000n,
      });
      const rr = await client.waitForTransactionReceipt({ hash: returned });
      if (rr.status !== "success") throw Error("User transfer back failed");
      transactions.push({
        step: `return ${m.ticker}`,
        hash: returned,
        block: rr.blockNumber,
      });
      const minimum =
        ((await quote(m.token, usdc, acquired, fees[i])) * 995n) / 1000n;
      await send(`approve sale ${m.ticker}`, m.token, erc20Abi, "approve", [
        swap,
        acquired,
      ]);
      const usdBefore = await balance(usdc);
      const failedHash = await wallet.writeContract({
        address: swap,
        abi: artifact.abi,
        functionName: "sell",
        args: [
          m.token,
          acquired,
          2n ** 128n,
          (await client.getBlock()).timestamp + 300n,
          "0x",
        ],
        gas: 5000000n,
      });
      const failedReceipt = await client.waitForTransactionReceipt({
        hash: failedHash,
      });
      if (
        failedReceipt.status !== "reverted" ||
        (await balance(m.token)) !== before + acquired ||
        (await balance(usdc)) !== usdBefore
      )
        throw Error("Slippage failure did not roll back atomically");
      evidence.slippageRevertedHash = failedHash;
      evidence.slippageRollback = true;
      await send(
        `sell ${m.ticker} through StocklineV3Swap`,
        swap,
        artifact.abi,
        "sell",
        [
          m.token,
          acquired,
          minimum,
          (await client.getBlock()).timestamp + 300n,
          "0x",
        ],
      );
      const received = (await balance(usdc)) - usdBefore;
      if (received < minimum || (await balance(m.token)) !== before)
        throw Error("Incorrect sale settlement");
      const allowance = await client.readContract({
        address: m.token,
        abi: erc20Abi,
        functionName: "allowance",
        args: [swap, router],
      });
      if (allowance !== 0n) throw Error("Residual router allowance");
      evidence.receivedUsdc = received;
      evidence.minimumUsdc = minimum;
      evidence.complete = true;
    } catch (e) {
      evidence.error = e instanceof Error ? e.message : String(e);
    }
    report.markets.push(evidence);
    console.log(
      JSON.stringify({
        ticker: m.ticker,
        complete: evidence.complete,
        error: evidence.error,
      }),
    );
  }
} catch (e) {
  report.errors.push(e instanceof Error ? e.message : String(e));
}
writeFileSync(
  "contracts/deployments/base-fork-evidence.json",
  JSON.stringify(
    report,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    transactions: transactions.length,
    errors: report.errors,
    productionReady: false,
  }),
);
if (
  report.errors.length ||
  report.markets.some((m) => !(m as { complete: boolean }).complete)
)
  process.exitCode = 1;
