import { base } from "viem/chains";
import type { MarketConfig } from "./types";

const actionLabels: Record<string, string> = {
  SupplyCollateral: "Collateral added",
  WithdrawCollateral: "Collateral withdrawn",
  Borrow: "USDC borrowed",
  Repay: "USDC repaid",
  RepayWithCollateral: "USDC repaid with collateral",
};

export function activityLabel(event: string) {
  return Object.hasOwn(actionLabels, event) ? actionLabels[event] : "Account activity";
}

export function activityAsset(
  event: string,
  args: { assets?: bigint; repaidAssets?: bigint },
  market: MarketConfig,
) {
  if (event === "SupplyCollateral" || event === "WithdrawCollateral") {
    return { asset: market.ticker, amount: args.assets, amountDecimals: market.collateralDecimals };
  }
  if (event === "Borrow" || event === "Repay" || event === "RepayWithCollateral") {
    return {
      asset: "USDC",
      amount: event === "RepayWithCollateral" ? args.repaidAssets : args.assets,
      amountDecimals: market.loanDecimals,
    };
  }
  return {};
}

export function activityExplorerUrl(chainId: number | undefined, hash: string) {
  if (chainId !== base.id || !/^0x[0-9a-fA-F]{64}$/.test(hash)) return null;
  return `${base.blockExplorers.default.url}/tx/${hash}`;
}
