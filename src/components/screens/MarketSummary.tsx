"use client";
import { useApp } from "@/context/AppContext";
import { display } from "@/lib/chain/amounts";
export function MarketSummary() {
  const app = useApp();
  const p = app.positions.find((p) => p.market.ticker === app.selectedTicker);
  if (!p) return <p>Market unavailable.</p>;
  const s = p.snapshot;
  return (
    <div className="space-y-2 break-words">
      <p>
        Borrow APR:{" "}
        {s ? display(s.borrowAprWad / 100000000000000n, 2) : "Unavailable"}%
      </p>
      <p>
        Liquidation LTV: {display(BigInt(p.market.lltv) * 100n, 18)}% ·
        Suggested limit: 50%
      </p>
      <p>
        Oracle: {s?.oracleValid ? "Valid" : "Unavailable; borrowing blocked"}
      </p>
      <p>Snapshot block: {s?.snapshotBlock.toString() ?? "Unavailable"}</p>
      <p>Positions are isolated. Another market cannot protect this loan.</p>
      {p.error && <p role="alert">{p.error}</p>}
    </div>
  );
}
