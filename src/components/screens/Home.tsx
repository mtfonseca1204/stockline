"use client";
import { StockLogo } from "@/components/brand/StockLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
import { display } from "@/lib/chain/amounts";
import { NetworkNotice } from "./Portfolio";
export function Home() {
  const app = useApp();
  const ready =
    app.correctNetwork &&
    app.positions.length > 0 &&
    app.positions.every((p) => p.snapshot?.oracleValid);
  const collateral = app.positions.reduce(
    (sum, p) => sum + (p.snapshot?.collateralValueUsdcRaw ?? 0n),
    0n,
  );
  const debt = app.positions.reduce(
    (sum, p) => sum + (p.snapshot?.debtAssetsRaw ?? 0n),
    0n,
  );
  const available = app.positions.reduce(
    (sum, p) => sum + (p.snapshot?.availableBorrowRaw ?? 0n),
    0n,
  );
  const usd = (raw: bigint) =>
    ready ? `$${display(raw / 10000n, 2)}` : "Unavailable";
  return (
    <div className="page animate-fade-up">
      <div>
        <p className="text-sm text-[var(--ink-muted)]">Your Portfolio</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--ink)]">
          {usd(collateral)}
        </p>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Keep your stocks. Unlock their value.
        </p>
      </div>
      <NetworkNotice />
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Collateral", collateral],
          ["Borrowed", debt],
          ["Available", available],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="surface-quiet flex flex-col gap-1 p-3"
          >
            <span className="text-[11px] text-[var(--ink-subtle)]">
              {label}
            </span>
            <span className="text-sm font-semibold">
              {usd(value as bigint)}
            </span>
          </div>
        ))}
      </div>
      {collateral === 0n ? (
        <Card className="space-y-3">
          <h2 className="text-lg">Add Collateral</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Add your tokenized stocks to unlock borrowing power.
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => app.setView("deposit")}
          >
            Add Collateral
          </Button>
        </Card>
      ) : (
        <Card className="space-y-3">
          <h2 className="text-lg">{debt > 0n ? "Your loan" : "Borrow USDC"}</h2>
          <p className="text-3xl font-semibold">
            {usd(debt > 0n ? debt : available)}
          </p>
          <p className="text-sm text-[var(--ink-muted)]">
            Your stocks remain deposited while your loan is active.
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={!ready || available === 0n}
              onClick={() => app.setView("borrow")}
            >
              {debt > 0n ? "Borrow more" : "Borrow"}
            </Button>
            {debt > 0n && (
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => app.setView("repay")}
              >
                Repay
              </Button>
            )}
          </div>
        </Card>
      )}
      <div className="flex gap-2">
        {collateral > 0n && (
          <>
            <Button
              variant="soft"
              className="flex-1"
              onClick={() => app.setView("deposit")}
            >
              Add Collateral
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => app.setView("withdraw")}
            >
              Withdraw
            </Button>
          </>
        )}
      </div>
      <button
        type="button"
        className="text-sm font-medium text-[var(--accent)]"
        onClick={() => app.setView("portfolio")}
      >
        View portfolio
      </button>
      <div className="flex flex-wrap gap-2 pt-1">
        {app.positions
          .filter((p) => (p.snapshot?.collateralRaw ?? 0n) > 0n)
          .map((p) => (
            <button
              key={p.market.marketId}
              onClick={() => app.openStock(p.market.ticker)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-2.5 py-1.5 text-xs"
            >
              <StockLogo ticker={p.market.ticker.replace(/c$/, "")} size={20} />
              <span className="font-semibold">{p.market.ticker}</span>
              <span className="text-[var(--ink-muted)]">
                {usd(p.snapshot?.collateralValueUsdcRaw ?? 0n)}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
