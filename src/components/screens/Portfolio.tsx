"use client";

import { StockLogo } from "@/components/brand/StockLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Expandable } from "@/components/ui/primitives";
import { useApp } from "@/context/AppContext";
import { formatPct, formatUsd, holdingValue } from "@/lib/calculations";
import { ChevronLeft } from "lucide-react";

export function Portfolio() {
  const { holdings, collateral, openStock, setView, hasPosition } = useApp();

  if (!hasPosition || holdings.length === 0) {
    return (
      <div className="page animate-fade-up">
        <h1 className="text-2xl text-[var(--ink)]">Your stocks</h1>
        <Card className="space-y-3 text-center">
          <p className="font-semibold text-[var(--ink)]">Your portfolio is empty</p>
          <p className="text-sm text-[var(--ink-muted)]">
            Add tokenized stocks to see your available credit.
          </p>
          <Button className="w-full" onClick={() => setView("deposit")}>
            Add stocks
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="page animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl text-[var(--ink)]">Your stocks</h1>
          <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
            {formatUsd(collateral)}
          </p>
          <p className="text-sm text-[var(--ink-muted)]">portfolio value</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setView("withdraw")}>
          Withdraw
        </Button>
      </div>

      <div className="surface overflow-hidden">
        {holdings.map((h, i) => {
          const value = holdingValue(h);
          const pct = collateral > 0 ? value / collateral : 0;
          return (
            <button
              key={h.ticker}
              type="button"
              onClick={() => openStock(h.ticker)}
              className={`interactive-row flex w-full items-center gap-3 px-4 py-3.5 text-left ${
                i > 0 ? "border-t border-[var(--border)]" : ""
              }`}
            >
              <StockLogo ticker={h.ticker} size={40} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--ink)]">{h.ticker}</p>
                <p className="truncate text-xs text-[var(--ink-muted)]">{h.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--ink)]">{formatUsd(value)}</p>
                <p className="text-xs text-[var(--ink-subtle)]">
                  {(pct * 100).toFixed(0)}%
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Button variant="soft" className="w-full" onClick={() => setView("deposit")}>
        Add stocks
      </Button>
    </div>
  );
}

export function StockDetail() {
  const { holdings, selectedTicker, collateral, setView, goBack } = useApp();
  const h = holdings.find((x) => x.ticker === selectedTicker);

  if (!h) {
    return (
      <div className="page">
        <Button variant="ghost" onClick={goBack}>
          Back
        </Button>
        <p className="text-sm text-[var(--ink-muted)]">Stock not found.</p>
      </div>
    );
  }

  const value = holdingValue(h);
  const contrib = collateral > 0 ? value / collateral : 0;

  return (
    <div className="page animate-fade-up">
      <button
        type="button"
        onClick={() => setView("portfolio")}
        className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]"
      >
        <ChevronLeft size={16} /> Portfolio
      </button>

      <div className="flex items-center gap-3">
        <StockLogo ticker={h.ticker} size={48} />
        <div>
          <h1 className="text-2xl text-[var(--ink)]">{h.ticker}</h1>
          <p className="text-sm text-[var(--ink-muted)]">{h.name}</p>
        </div>
      </div>
      <div>
        <p className="mt-1 text-3xl font-semibold text-[var(--ink)]">
          {formatUsd(value)}
        </p>
        <p
          className={`mt-1 text-sm font-medium ${
            h.change24h >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
          }`}
        >
          {h.change24h >= 0 ? "+" : ""}
          {h.change24h.toFixed(1)}%
        </p>
      </div>

      <Card className="space-y-4">
        <Row label="Portfolio contribution" value={`${(contrib * 100).toFixed(0)}%`} />
        <Row label="Used as backing" value={formatUsd(value)} />
      </Card>

      <Card quiet className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
          Simple chart
        </p>
        <div className="flex h-24 items-end gap-1">
          {[40, 48, 45, 55, 52, 62, 58, 70, 66, 78, 74, 82].map((hgt, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-[var(--accent-soft)]"
              style={{ height: `${hgt}%` }}
            />
          ))}
        </div>
      </Card>

      <Expandable label="View details">
        <Row label="Eligible as backing" value="Yes" />
        <Row label="Borrowing factor" value={formatPct(h.collateralFactor)} />
        <Row label="Volatility (24h)" value={`${h.change24h.toFixed(1)}%`} />
        <Row label="Money generated (APR)" value={formatPct(h.yieldApr)} />
      </Expandable>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <span className="font-semibold text-[var(--ink)]">{value}</span>
    </div>
  );
}
