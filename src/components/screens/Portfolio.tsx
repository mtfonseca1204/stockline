"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
import { formatUsd, holdingValue } from "@/lib/calculations";

export function Portfolio() {
  const { holdings, collateral, setView } = useApp();

  return (
    <div className="page animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {formatUsd(collateral)} collateral
          </p>
        </div>
        <Button size="sm" variant="soft" onClick={() => setView("deposit")}>
          Supply
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex justify-between px-5 py-3 text-xs text-[var(--ink-subtle)] border-b border-[var(--border)]">
          <span>Asset</span>
          <span>Value</span>
        </div>
        {holdings.map((h) => {
          const value = holdingValue(h);
          const pct = collateral > 0 ? (value / collateral) * 100 : 0;
          return (
            <div
              key={h.ticker}
              className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] last:border-0"
            >
              <div>
                <p className="font-semibold">{h.ticker}</p>
                <p className="text-xs text-[var(--ink-muted)]">
                  {pct.toFixed(0)}% · {(h.yieldApr * 100).toFixed(1)}% yield
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatUsd(value)}</p>
                <p
                  className={`text-xs font-medium ${
                    h.change24h >= 0
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]"
                  }`}
                >
                  {h.change24h >= 0 ? "+" : ""}
                  {h.change24h.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
