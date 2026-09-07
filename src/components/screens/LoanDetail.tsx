"use client";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StockLogo } from "@/components/brand/StockLogo";
import { display } from "@/lib/chain/amounts";
import { NetworkNotice, Row } from "./Portfolio";
export function LoanDetail() {
  const app = useApp();
  const loans = app.positions.filter(
    (p) => (p.snapshot?.borrowShares ?? 0n) > 0n,
  );
  return (
    <div className="page animate-fade-up">
      <h1 className="text-2xl">Your loans</h1>
      <NetworkNotice />
      {!loans.length && (
        <Card className="space-y-3">
          <h2 className="text-lg">No active loans</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Borrow USDC against your deposited stocks.
          </p>
          <Button className="w-full" onClick={() => app.setView("borrow")}>
            Borrow
          </Button>
        </Card>
      )}
      {loans.map((p) => (
        <Card key={p.market.marketId} className="space-y-4">
          <div className="flex items-center gap-3">
            <StockLogo ticker={p.market.ticker.replace(/c$/, "")} size={40} />
            <h2 className="text-lg">{p.market.ticker}</h2>
          </div>
          <p className="text-3xl font-semibold">
            {display(p.snapshot!.debtAssetsRaw / 10000n, 2)} USDC
          </p>
          <Row
            label="Borrow APR"
            value={`${display(p.snapshot!.borrowAprWad / 100000000000000n, 2)}%`}
          />
          <Row
            label="Health"
            value={
              p.snapshot?.oracleValid
                ? display(p.snapshot.healthFactorWad / 10000000000000000n, 2)
                : "Unavailable"
            }
          />
          <p className="text-xs text-[var(--ink-muted)]">
            Each loan is backed by its own stock collateral.
          </p>
          <Button
            className="w-full"
            onClick={() => {
              app.openStock(p.market.ticker);
              app.setView("repay");
            }}
          >
            Repay loan
          </Button>
        </Card>
      ))}
    </div>
  );
}
