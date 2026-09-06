"use client";

import { StockLogo } from "@/components/brand/StockLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/calculations";
import { ChevronLeft } from "lucide-react";

export function Portfolio() {
  const { holdings, collateral, openStock, setView } = useApp();

  if (holdings.length === 0) {
    return (
      <div className="page animate-fade-up">
        <h1 className="text-2xl text-[var(--ink)]">Your stocks</h1>
        <Card className="space-y-3 text-center">
          <p className="font-semibold text-[var(--ink)]">No collateral yet</p>
          <p className="text-sm text-[var(--ink-muted)]">
            Add tokenized stocks to unlock borrowing power.
          </p>
          <Button className="w-full" onClick={() => setView("deposit")}>
            Add Collateral
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="page animate-fade-up">
      <div>
        <h1 className="text-2xl text-[var(--ink)]">Your stocks</h1>
        <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
          {formatUsd(collateral)}
        </p>
        <p className="text-sm text-[var(--ink-muted)]">collateral value</p>
      </div>

      <div className="surface overflow-hidden">
        {holdings.map((h, i) => {
          const pct = collateral > 0 ? h.value / collateral : 0;
          const gain = h.value - h.costBasis;
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
                <p className="font-semibold text-[var(--ink)]">
                  {formatUsd(h.value)}
                </p>
                <p
                  className={`text-xs ${
                    gain > 0
                      ? "text-[var(--success)]"
                      : "text-[var(--ink-subtle)]"
                  }`}
                >
                  {gain > 0 ? `+${formatUsd(gain)}` : `${(pct * 100).toFixed(0)}%`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Button variant="soft" className="w-full" onClick={() => setView("deposit")}>
        Add Collateral
      </Button>
    </div>
  );
}

export function StockDetail() {
  const { holdings, selectedTicker, collateral, setView } = useApp();
  const h = holdings.find((x) => x.ticker === selectedTicker);

  if (!h) {
    return (
      <div className="page">
        <Button variant="ghost" onClick={() => setView("portfolio")}>
          Back
        </Button>
        <p className="text-sm text-[var(--ink-muted)]">Stock not found.</p>
      </div>
    );
  }

  const contrib = collateral > 0 ? h.value / collateral : 0;
  const gain = h.value - h.costBasis;

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
        <p className="text-3xl font-semibold text-[var(--ink)]">
          {formatUsd(h.value)}
        </p>
        {gain !== 0 ? (
          <p
            className={`mt-1 text-sm font-medium ${
              gain > 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
            }`}
          >
            {gain > 0 ? "+" : ""}
            {formatUsd(gain)} since deposit
          </p>
        ) : null}
      </div>

      <Card className="space-y-4">
        <Row
          label="Portfolio contribution"
          value={`${(contrib * 100).toFixed(0)}%`}
        />
        <Row label="Used as collateral" value={formatUsd(h.value)} />
        <Row label="Deposited at" value={formatUsd(h.costBasis)} />
      </Card>
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
