import { display, referenceUsd } from "@/lib/chain/amounts";
import type { MarketPosition } from "@/lib/chain/types";
export function StockValue({
  position,
  amount,
  prominent = false,
  hideUnavailable = false,
  parenthesized = false,
}: {
  prominent?: boolean;
  hideUnavailable?: boolean;
  parenthesized?: boolean;
  position?: MarketPosition;
  amount: bigint | null | undefined;
}) {
  const value = referenceUsd(
    amount,
    position?.market.collateralDecimals ?? 8,
    position?.referencePrice,
  );
  if (value === null && hideUnavailable) return null;
  let text = "USD value unavailable";
  if (value !== null) text = parenthesized ? `($${display(value)})` : `≈ $${display(value)}`;
  return (
    <span
      className={prominent ? "text-inherit" : "text-xs font-normal text-[var(--ink-muted)]"}
    >
      {text}
    </span>
  );
}
