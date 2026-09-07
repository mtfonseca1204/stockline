"use client";
import { ComingSoonMarkets } from "./ComingSoonMarkets";
import { networkName, environmentLabel } from "@/lib/chain/config";
import { StockLogo } from "@/components/brand/StockLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Expandable, EnvPill, InlineAlert } from "@/components/ui/primitives";
import { useApp } from "@/context/AppContext";
import { display } from "@/lib/chain/amounts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MarketSummary } from "./MarketSummary";

export function Portfolio() {
  const app = useApp();
  return (
    <div className="page animate-fade-up">
      <div>
        <h1 className="display text-2xl text-[var(--ink)]">Your stocks</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Your tokenized stocks and collateral positions.
        </p>
      </div>
      <NetworkNotice />
      <div className="surface overflow-hidden">
        {app.positions.map((p, i) => (
          <button
            key={p.market.marketId}
            type="button"
            disabled={!p.market.enabled}
            onClick={() => app.openStock(p.market.ticker)}
            className={`interactive-row flex w-full items-center gap-3 px-4 py-3.5 text-left ${i > 0 ? "border-t border-[var(--border)]" : ""}`}
          >
            <StockLogo ticker={p.market.ticker.replace(/c$/, "")} size={40} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.market.ticker}</p>
              <p className="text-xs text-[var(--ink-muted)]">
                {display(
                  p.snapshot?.collateralRaw,
                  p.market.collateralDecimals,
                )}{" "}
                deposited
              </p>
            </div>
            {!p.market.enabled && (
              <span className="shrink-0 rounded-full bg-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-muted)]">
                Coming soon
              </span>
            )}
            <div className="text-right">
              <p className="font-semibold">
                {p.snapshot?.oracleValid
                  ? `$${display(p.snapshot.collateralValueUsdcRaw / 10000n, 2)}`
                  : "Unavailable"}
              </p>
              <p className="text-xs text-[var(--ink-subtle)]">
                collateral value
              </p>
            </div>
            <ChevronRight size={16} className="text-[var(--ink-subtle)]" />
          </button>
        ))}
        <ComingSoonMarkets />
      </div>
      <Button
        className="w-full"
        onClick={() => app.setView("deposit")}
      >
        Add Collateral
      </Button>
    </div>
  );
}
export function NetworkNotice() {
  const app = useApp();
  return (
    <>
      {!app.connected && (
        <Card quiet>Connect your wallet to see your stocks.</Card>
      )}
      {app.connected && !app.correctNetwork && (
        <Button onClick={app.switchNetwork}>Switch to {networkName}</Button>
      )}
      {app.loading && (
        <p role="status" className="text-sm text-[var(--ink-muted)]">
          Reading positions…
        </p>
      )}
      {app.error && (
        <InlineAlert>Unable to read your positions. Please refresh.</InlineAlert>
      )}
      <EnvPill>{environmentLabel}</EnvPill>
    </>
  );
}
export function StockDetail() {
  const app = useApp();
  const p = app.positions.find((p) => p.market.ticker === app.selectedTicker);
  return (
    <div className="page animate-fade-up">
      <button
        className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]"
        onClick={() => app.setView("portfolio")}
      >
        <ChevronLeft size={16} /> Portfolio
      </button>
      <div className="flex items-center gap-3">
        <StockLogo
          ticker={(app.selectedTicker ?? "").replace(/c$/, "")}
          size={48}
        />
        <div>
          <h1 className="text-2xl">{app.selectedTicker}</h1>
          <p className="text-sm text-[var(--ink-muted)]">Tokenized stock</p>
        </div>
      </div>
      <p className="text-3xl font-semibold">
        {p?.snapshot?.oracleValid
          ? `$${display(p.snapshot.collateralValueUsdcRaw / 10000n, 2)}`
          : "Value unavailable"}
      </p>
      <Card className="space-y-4">
        <Row
          label="Deposited"
          value={`${display(p?.snapshot?.collateralRaw, p?.market.collateralDecimals)} tokens`}
        />
        <Row
          label="Borrowed"
          value={`${display(p?.snapshot?.debtAssetsRaw)} USDC`}
        />
        <Row label="Deposit reference / PnL" value="Unavailable" />
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => app.setView("deposit")}>Add Collateral</Button>
        <Button variant="secondary" onClick={() => app.setView("withdraw")}>
          Withdraw
        </Button>
      </div>
      <Expandable label="Market details">
        <MarketSummary />
      </Expandable>
    </div>
  );
}
export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <span className="text-right font-semibold break-words">{value}</span>
    </div>
  );
}
