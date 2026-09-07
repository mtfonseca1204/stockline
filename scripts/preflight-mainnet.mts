// Read-only. Never imports a wallet client or a signing key.
import {
  createPublicClient,
  http,
  erc20Abi,
  parseAbi,
  type Address,
} from "viem";
import { base } from "viem/chains";
import { writeFileSync, mkdirSync } from "node:fs";
const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL ?? "https://mainnet.base.org"),
});
const morpho = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";
const usdc = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const irm = "0x46415998764C29aB2a25CbeA6254146D50D22687";
const registry = "0x3f3E8cf41cdd3b1D118c16471aB0113DfDDd5CaD";
const definitions = [
  [
    "NVDAc",
    "0xb20000000000000000000078ee7ce2fE4908108C",
    "0x04689a41629776563E6822F76f2e57D148d28513",
  ],
  [
    "AAPLc",
    "0xb200000000000000000000C2e324d24d7eEcd1fb",
    "0x787f13dEa48Db0897CbCDD985de77809D837F988",
  ],
  [
    "MSFTc",
    "0xB200000000000000000000Ab99cFa739E253872B",
    "0xeB10A6c9aa7E537aEd766C08c35Dae35B321b18c",
  ],
  [
    "METAc",
    "0xb2000000000000000000008bC8786B856E61707C",
    "0x6526aE6797A76123638b863AeE4dD27Ba4E4b27D",
  ],
] as const;
const feedAbi = parseAbi([
  "function decimals() view returns(uint8)",
  "function latestRoundData() view returns(uint80,int256,uint256,uint256,uint80)",
]);
const coreAbi = parseAbi([
  "function isIrmEnabled(address) view returns(bool)",
  "function isLltvEnabled(uint256) view returns(bool)",
]);
const blockNumber = await client.getBlockNumber();
const block = await client.getBlock({ blockNumber });
const coreCode = await client.getCode({ address: morpho, blockNumber });
const markets = [];
for (const [ticker, token, feed] of definitions) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const result = await (async () => {
    try {
      const delay = async <T,>(promise: Promise<T>) => {
        const result = await promise;
        await new Promise((resolve) => setTimeout(resolve, 600));
        return result;
      };
      const [symbol, decimals, code, feedDecimals, round] = [
        await delay(
          client.readContract({
            address: token,
            abi: erc20Abi,
            functionName: "symbol",
            blockNumber,
          }),
        ),
        await delay(
          client.readContract({
            address: token,
            abi: erc20Abi,
            functionName: "decimals",
            blockNumber,
          }),
        ),
        await delay(client.getCode({ address: token, blockNumber })),
        await delay(
          client.readContract({
            address: feed,
            abi: feedAbi,
            functionName: "decimals",
            blockNumber,
          }),
        ),
        await delay(
          client.readContract({
            address: feed,
            abi: feedAbi,
            functionName: "latestRoundData",
            blockNumber,
          }),
        ),
      ] as const;
      return {
        ticker,
        token,
        feed,
        symbol,
        decimals,
        code,
        feedDecimals,
        round,
        enabled: false,
        checks: {
          metadata: symbol.toLowerCase() === ticker.toLowerCase(),
          positivePrice: round[1] > 0n,
          nonFutureTimestamp: round[3] <= block.timestamp,
        },
        blockers: [
          "Issuer transfer policies and custody paths not validated",
          "Session source and oracle recovery policy not verified",
          "Executable swap and liquidation route not verified",
          "No production market or Stockline deployment",
          "USDC seed amount and lender address pending",
        ],
      };
    } catch (e) {
      return {
        ticker,
        token,
        feed,
        enabled: false,
        error: e instanceof Error ? e.message.split("\n")[0] : "RPC failure",
      };
    }
  })();
  markets.push(result);
}
const safe = async <T,>(call: () => Promise<T>) => {
  try {
    return await call();
  } catch (e) {
    return {
      error: e instanceof Error ? e.message.split("\n")[0] : "RPC failure",
    };
  }
};
const report = {
  schemaVersion: 1,
  chainId: await client.getChainId(),
  blockNumber,
  blockHash: block.hash,
  timestamp: block.timestamp,
  productionReady: false,
  morpho,
  usdc,
  irm,
  registry,
  coreCodePresent: !!coreCode && coreCode !== "0x",
  irmEnabled: await safe(() =>
    client.readContract({
      address: morpho,
      abi: coreAbi,
      functionName: "isIrmEnabled",
      args: [irm as Address],
      blockNumber,
    }),
  ),
  lltv80Enabled: await safe(() =>
    client.readContract({
      address: morpho,
      abi: coreAbi,
      functionName: "isLltvEnabled",
      args: [800000000000000000n],
      blockNumber,
    }),
  ),
  markets,
};
mkdirSync("contracts/deployments", { recursive: true });
writeFileSync(
  "contracts/deployments/8453.preflight.json",
  JSON.stringify(
    report,
    (_, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    {
      chainId: report.chainId,
      blockNumber: String(blockNumber),
      productionReady: false,
      markets: markets.map((m) => ({
        ticker: m.ticker,
        enabled: m.enabled,
        error: "error" in m ? m.error : undefined,
      })),
    },
    null,
    2,
  ),
);
