"use client";
import { useApp } from "@/context/AppContext";
import { display } from "@/lib/chain/amounts";
export function MarketSummary() {
  const app = useApp();
  const p = app.positions.find((p) => p.market.ticker === app.selectedTicker);
  if (!p) return <p>Market unavailable.</p>;
  const s = p.snapshot;
  return (
    <div className="space-y-2 break-words text-sm text-[var(--ink-muted)]">
      <p>
        Borrow APR:{" "}
        <span className="font-semibold text-[var(--ink)]">
          {s ? display(s.borrowAprWad / 100000000000000n, 2) : "Unavailable"}%
        </span>
      </p>
      <p>
        Suggested borrow limit:{" "}
        <span className="font-semibold text-[var(--ink)]">50%</span>
      </p>
      <p>
        Price status:{" "}
        {s?.oracleValid ? "Available" : "Unavailable — borrowing paused"}
      </p>
      <p>Each loan is backed only by its own stock collateral.</p>
      {p.error && <p className="text-[var(--danger)]">{p.error}</p>}
    </div>
  );
}
