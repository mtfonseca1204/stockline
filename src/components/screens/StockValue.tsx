import { display, referenceUsd } from "@/lib/chain/amounts";
import type { MarketPosition } from "@/lib/chain/types";
export function StockValue({
  position,
  amount,
  prominent = false,
}: {
  prominent?: boolean;
  position?: MarketPosition;
  amount: bigint | null | undefined;
}) {
  const value = referenceUsd(
    amount,
  prominent = false,
    position?.market.collateralDecimals ?? 8,
    position?.referencePrice,
  );
  const updated = position?.referencePrice?.updatedAt;
  return (
    <span
      className={prominent ? "text-inherit" : "text-xs font-normal text-[var(--ink-muted)]"}
      title={
        updated
          ? `Reference price published ${new Date(Number(updated) * 1000).toLocaleString()}`
          : undefined
      }
    >
      {value === null ? "USD value unavailable" : `≈ $${display(value)}`}
      {value !== null && <span className="text-xs font-normal text-[var(--ink-muted)]"> · last published price</span>}
    </span>
  );
}
