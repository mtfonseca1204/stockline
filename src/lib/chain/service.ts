import {
  pendingKey,
  loadPending,
  savePending,
  clearPending,
  isWalletRejection,
} from "./pending";
import {
  encodeFunctionData,
  encodeAbiParameters,
  keccak256,
  erc20Abi,
  parseAbi,
  type Abi,
  type Address,
  type Hex,
} from "viem";
import { getAccount, getWalletClient } from "wagmi/actions";
import { config, deployment, publicClient } from "./config";
import legacy from "./generated/legacy-base.json";
import coreJson from "./generated/Morpho.json";
import lensJson from "./generated/StocklineLens.json";
import adapterJson from "./generated/StocklineRepayAdapter.json";
import swapJson from "./generated/StocklineV3Swap.json";
import { marketParams, errorMessage } from "./amounts";
import type {
  Action,
  Activity,
  MarketConfig,
  MarketPosition,
  Quote,
  Snapshot,
  TxState,
} from "./types";
export const coreAbi = coreJson as Abi;
export const adapterAbi = adapterJson as Abi;
const lensAbi = lensJson as Abi;
const swapAbi = swapJson as Abi;
const feedAbi = parseAbi([
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
]);
async function readReferencePrice(market: MarketConfig, blockNumber: bigint) {
  try {
    const [decimals, round, block] = await Promise.all([
      publicClient.readContract({address:market.feed,abi:feedAbi,functionName:"decimals",blockNumber}),
      publicClient.readContract({address:market.feed,abi:feedAbi,functionName:"latestRoundData",blockNumber}),
      publicClient.getBlock({blockNumber}),
    ]);
    if (round[1] <= 0n || round[3] === 0n || round[3] > block.timestamp || round[4] < round[0]) return null;
    return {answer:round[1],decimals,updatedAt:round[3]};
  } catch { return null; }
}
export function requireDeployment() {
  if (!deployment)
    throw new Error(
      "Base mainnet is blocked pending deployment and asset verification.",
    );
  for (const market of deployment.markets) {
    const id = keccak256(
      encodeAbiParameters(
        [
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "uint256" },
        ],
        [
          market.loanToken,
          market.collateralToken,
          market.oracle,
          market.irm,
          BigInt(market.lltv),
        ],
      ),
    );
    if (
      id !== market.marketId ||
      BigInt(market.uiMaxLtvWad) >= BigInt(market.lltv)
    )
      throw new Error("Invalid market manifest.");
  }
  return deployment;
}
export async function readPositions(owner: Address, markets: MarketConfig[] = deployment.markets): Promise<MarketPosition[]> {
  const d = requireDeployment();
  const blockNumber = await publicClient.getBlockNumber({ cacheTime: 0 });
  return Promise.all(
    markets.map(async (market) => {
      try {
        const [snapshot, walletCollateral, walletUsdc, referencePrice] = await Promise.all([
          publicClient.readContract({
            address: d.lens,
            abi: lensAbi,
            functionName: "snapshot",
            args: [
              d.morpho,
              marketParams(market),
              owner,
              BigInt(market.uiMaxLtvWad),
            ],
            blockNumber,
          }),
          publicClient.readContract({
            address: market.collateralToken,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [owner],
            blockNumber,
          }),
          publicClient.readContract({
            address: d.usdc,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [owner],
            blockNumber,
          }),
          readReferencePrice(market, blockNumber),
        ]);
        return {
          referencePrice,
          market,
          snapshot: snapshot as Snapshot,
          walletCollateral,
          walletUsdc,
          error: null,
        };
      } catch (e) {
        return {
          market,
          snapshot: null,
          walletCollateral: null,
          walletUsdc: null,
          error: errorMessage(e),
        };
      }
    }),
  );
}
export async function quoteSale(
  owner: Address,
  market: MarketConfig,
  amount: bigint,
  repayAll: boolean,
): Promise<Quote> {
  const d = requireDeployment();
  const position = (await readPositions(owner)).find(
    (p) => p.market.marketId === market.marketId,
  );
  const s = position?.snapshot;
  if (!s?.oracleValid || s.borrowShares === 0n)
    throw new Error("A valid price and positive debt are required.");
  if (amount <= 0n || amount > s.collateralRaw)
    throw new Error("Invalid collateral quantity.");
  const block = await publicClient.getBlock({ blockNumber: s.snapshotBlock });
  const output = (await publicClient.readContract({
    address: d.swap,
    abi: swapAbi,
    functionName: "quote",
    args: [market.collateralToken, amount],
    blockNumber: s.snapshotBlock,
  })) as bigint;
  const minimum = (output * 995n) / 1000n;
  const maxRepay = s.debtAssetsRaw + s.debtAssetsRaw / 1000n + 2n;
  // Partial mode pays no more than 99% of the current debt; full repayment uses live shares.
  const partialCap = (s.debtAssetsRaw * 99n) / 100n;
  const repayAssets = minimum < partialCap ? minimum : partialCap;
  if (!repayAll && repayAssets === 0n)
    throw new Error("Use repay all for this small remaining debt.");
  if (repayAll && minimum < maxRepay)
    throw new Error(
      "Sell enough collateral to cover debt and the interest buffer.",
    );
  const debtAfter = repayAll ? 0n : s.debtAssetsRaw - repayAssets;
  const collateralAfter = s.collateralRaw - amount;
  const limit =
    (((collateralAfter * s.price) / 10n ** 36n) * BigInt(market.lltv)) /
    10n ** 18n;
  const healthAfter =
    debtAfter === 0n ? null : (limit * 10n ** 18n) / debtAfter;
  if (healthAfter !== null && healthAfter < 1100000000000000000n)
    throw new Error(
      "The remaining position would be too close to liquidation.",
    );
  const request = {
    marketId: market.marketId,
    repayAssets: repayAll ? 0n : repayAssets,
    repayAll,
    maxRepayAssets: maxRepay,
    collateralAssetsToSell: amount,
    minUsdcOut: minimum,
    minHealthFactorWad: 1100000000000000000n,
    deadline: block.timestamp + 300n,
    routeData: "0x" as Hex,
  };
  let gasEstimate: bigint | null = null;
  const authorized = await publicClient.readContract({
    address: d.morpho,
    abi: coreAbi,
    functionName: "isAuthorized",
    args: [owner, d.adapter],
  });
  if (authorized)
    gasEstimate = await publicClient.estimateGas({
      account: owner,
      to: d.adapter,
      data: encodeFunctionData({
        abi: adapterAbi,
        functionName: "repayWithCollateral",
        args: [request],
      }),
    });
  return {
    request,
    owner,
    block: s.snapshotBlock,
    output,
    debtAfter,
    collateralAfter,
    healthAfter,
    gasEstimate,
  };
}
export async function execute(
  action: Action,
  market: MarketConfig,
  amount: bigint,
  owner: Address,
  update: (s: TxState) => void,
  quote?: Quote,
) {
  const d = requireDeployment();
  const storageKey = pendingKey(d.chainId, owner);
  const previous = loadPending(storageKey);
  if (previous) {
    if (!previous.hash)
      throw new Error(
        "A previous submission has an unknown outcome. Reconcile it in your wallet before submitting again.",
      );
    const receipt = await publicClient
      .getTransactionReceipt({ hash: previous.hash })
      .catch(() => null);
    if (!receipt)
      throw new Error(
        "A previous transaction is pending. Wait for its receipt before submitting again.",
      );
    clearPending(storageKey);
    throw new Error(
      "The previous transaction has settled. Refresh the position and review again.",
    );
  }
  const currentMarket = d.markets.some(m => m.marketId === market.marketId);
  const legacyExit = d.chainId === 8453 && legacy.markets.some(m => m.marketId === market.marketId) && ["withdraw", "repay", "repayAll"].includes(action);
  if (!market.enabled || (!currentMarket && !legacyExit)) throw new Error("This market only permits legacy repayment and withdrawal.");
  const checkContext = () => {
    const current = getAccount(config);
    if (
      current.address?.toLowerCase() !== owner.toLowerCase() ||
      current.chainId !== d.chainId
    )
      throw new Error("Wallet or network changed. Review the operation again.");
  };
  let approvalBlock: bigint | undefined;
  const send = async (
    to: Address,
    abi: Abi,
    fn: string,
    args: readonly unknown[],
    approval = false,
  ) => {
    checkContext();
    const wallet = await getWalletClient(config);
    const data = encodeFunctionData({ abi, functionName: fn, args });
    await publicClient.call({ account: owner, to, data, blockNumber: approvalBlock });
    const estimate = await publicClient.estimateGas({
      account: owner,
      to,
      data,
      blockNumber: approvalBlock,
    });
    checkContext();
    update({ phase: approval ? "approval-signature" : "signature" });
    const pending = { to, data, submittedAt: Date.now() };
    savePending(storageKey, pending);
    let hash: Hex;
    try {
      hash = await wallet.sendTransaction({
        account: owner,
        to,
        data,
        gas: (estimate * 130n) / 100n + 20000n,
        chain: wallet.chain,
      });
    } catch (error) {
      if (isWalletRejection(error)) clearPending(storageKey);
      throw error;
    }
    savePending(storageKey, { ...pending, hash });
    update({ phase: approval ? "approval-pending" : "pending", hash });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      onReplaced: (r) => {
        savePending(storageKey, { ...pending, hash: r.transaction.hash });
        update({
          phase: approval ? "approval-pending" : "pending",
          hash: r.transaction.hash,
          message: r.reason,
        });
      },
    });
    if (receipt.status !== "success") {
      clearPending(storageKey);
      throw new Error(`Transaction reverted: ${receipt.transactionHash}`);
    }
    // A cancellation has a successful receipt but did not execute our calldata.
    const transaction = await publicClient.getTransaction({
      hash: receipt.transactionHash,
    });
    clearPending(storageKey);
    if (
      transaction.to?.toLowerCase() !== to.toLowerCase() ||
      transaction.input !== data
    )
      throw new Error(
        "Transaction was cancelled or replaced with a different operation.",
      );
    if (approval) {
      approvalBlock = receipt.blockNumber;
      update({ phase: "approval-confirmed", hash: receipt.transactionHash });
    }
    checkContext();
    return receipt.transactionHash;
  };
  const approve = async (token: Address, needed: bigint) => {
    const allowance = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, d.morpho],
    });
    if (allowance < needed)
      await send(token, erc20Abi, "approve", [d.morpho, needed], true);
  };
  let hash: Hex;
  const mp = marketParams(market);
  if (action === "authorize" || action === "revoke") {
    hash = await send(d.morpho, coreAbi, "setAuthorization", [
      d.adapter,
      action === "authorize",
    ]);
  } else if (action === "sell") {
    if (
      !quote ||
      quote.owner.toLowerCase() !== owner.toLowerCase() ||
      quote.request.marketId !== market.marketId
    )
      throw new Error("Request a new quote.");
    hash = await send(d.adapter, adapterAbi, "repayWithCollateral", [
      quote.request,
    ]);
  } else {
    const p = (await readPositions(owner, [market])).find(
      (p) => p.market.marketId === market.marketId,
    );
    if (!p?.snapshot) throw new Error("Could not read the current position.");
    if (action !== "repayAll" && amount <= 0n)
      throw new Error("Amount must be positive.");
    switch (action) {
      case "deposit":
        await approve(market.collateralToken, amount);
        hash = await send(d.morpho, coreAbi, "supplyCollateral", [
          mp,
          amount,
          owner,
          "0x",
        ]);
        break;
      case "borrow":
        if (!p.snapshot.oracleValid || amount > p.snapshot.availableBorrowRaw)
          throw new Error(
            "Amount exceeds available credit or market liquidity.",
          );
        hash = await send(d.morpho, coreAbi, "borrow", [
          mp,
          amount,
          0n,
          owner,
          owner,
        ]);
        break;
      case "repay":
        await approve(d.usdc, amount);
        hash = await send(d.morpho, coreAbi, "repay", [
          mp,
          amount,
          0n,
          owner,
          "0x",
        ]);
        break;
      case "repayAll": {
        await approve(
          d.usdc,
          p.snapshot.debtAssetsRaw + p.snapshot.debtAssetsRaw / 1000n + 2n,
        );
        const latest = (await readPositions(owner)).find(
          (p) => p.market.marketId === market.marketId,
        )?.snapshot;
        if (!latest || latest.borrowShares === 0n)
          throw new Error("No debt to repay.");
        hash = await send(d.morpho, coreAbi, "repay", [
          mp,
          0n,
          latest.borrowShares,
          owner,
          "0x",
        ]);
        break;
      }
      case "withdraw":
        hash = await send(d.morpho, coreAbi, "withdrawCollateral", [
          mp,
          amount,
          owner,
          owner,
        ]);
        break;
    }
  }
  update({ phase: "confirmed", hash });
  return hash;
}
const historyAbi = parseAbi([
  "event SupplyCollateral(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets)",
  "event WithdrawCollateral(bytes32 indexed id, address caller, address indexed onBehalf, address indexed receiver, uint256 assets)",
  "event Borrow(bytes32 indexed id, address caller, address indexed onBehalf, address indexed receiver, uint256 assets, uint256 shares)",
  "event Repay(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets, uint256 shares)",
  "event RepayWithCollateral(address indexed user, bytes32 indexed marketId, uint256 collateralSold, uint256 repaidAssets, uint256 usdcRefunded)",
]);
export async function readHistory(owner: Address): Promise<Activity[]> {
  const d = requireDeployment();
  const to = await publicClient.getBlockNumber({ cacheTime: 0 });
  const minimum = BigInt(d.indexFromBlock);
  const start = to > minimum + 50000n ? to - 50000n : minimum;
  const grouped = new Map<string, Activity>();
  for (let from = start; from <= to; from += 2000n) {
    const end = from + 1999n < to ? from + 1999n : to;
    const logs = await publicClient.getLogs({
      address: [d.morpho, d.adapter],
      events: historyAbi,
      fromBlock: from,
      toBlock: end,
    });
    for (const log of logs) {
      const args = log.args as {
        onBehalf?: Address;
        user?: Address;
        id?: Hex;
        marketId?: Hex;
        assets?: bigint;
        repaidAssets?: bigint;
      };
      if ((args.onBehalf ?? args.user)?.toLowerCase() !== owner.toLowerCase())
        continue;
      const market = d.markets.find(
        (m) => m.marketId === (args.id ?? args.marketId),
      );
      if (!market) continue;
      const key = `${d.chainId}:${log.transactionHash}`;
      if (grouped.get(key)?.label === "RepayWithCollateral") continue;
      const block = await publicClient.getBlock({
        blockNumber: log.blockNumber,
      });
      grouped.set(key, {
        id: `${key}:${log.logIndex}`,
        hash: log.transactionHash,
        block: log.blockNumber,
        label: log.eventName,
        detail: market.ticker,
        timestamp: block.timestamp,
      });
    }
  }
  return [...grouped.values()].sort((a, b) => (a.block > b.block ? -1 : 1));
}
