import type { MarketPosition } from "./types";
export function inputLimit(
  action: "deposit" | "borrow" | "repay" | "withdraw",
  sell: boolean,
  position?: MarketPosition,
): bigint | null {
  if (!position) return null;
  const s = position.snapshot;
  if (action === "deposit") return position.walletCollateral;
  if (!s) return null;
  if (sell) return s.collateralRaw;
  if (action === "borrow") return s.oracleValid ? s.availableBorrowRaw : null;
  if (action === "repay") {
    if (position.walletUsdc === null) return null;
    return position.walletUsdc < s.debtAssetsRaw
      ? position.walletUsdc
      : s.debtAssetsRaw;
  }
  if (s.borrowShares === 0n) return s.collateralRaw;
  if (!s.oracleValid || s.price === 0n) return null;
  // Round each inverse valuation up to preserve Morpho's liquidation threshold.
  const ceil = (n: bigint, d: bigint) => (n + d - 1n) / d;
  const requiredValue = ceil(
    s.debtAssetsRaw * 10n ** 18n,
    BigInt(position.market.lltv),
  );
  const requiredCollateral = ceil(requiredValue * 10n ** 36n, s.price);
  return requiredCollateral >= s.collateralRaw
    ? 0n
    : s.collateralRaw - requiredCollateral;
}
export function percentageAmount(
  limit: bigint,
  percent: 25 | 50 | 75 | 100,
): bigint {
  return (limit * BigInt(percent)) / 100n;
}
