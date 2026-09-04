"use client";

import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useApp } from "@/context/AppContext";
import {
  availableCredit,
  formatPct,
  formatUsd,
  ltv,
} from "@/lib/calculations";
import { DEMO_HOLDINGS } from "@/lib/mock-data";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";

export function DepositFlow() {
  const { holdings, debt, credit, depositCollateral, goBack, setView } =
    useApp();

  const availableAssets = useMemo(() => {
    const source = holdings.length === 0 ? DEMO_HOLDINGS : holdings;
    return source.map((h) => ({
      ticker: h.ticker,
      name: h.name,
      available: h.availableToDeposit * h.price,
    }));
  }, [holdings]);

  const [selected, setSelected] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedTotal = Object.values(selected).reduce((a, b) => a + b, 0);
  const currentCollateral = holdings.reduce(
    (s, h) => s + h.quantity * h.price,
    0
  );
  const newCollateral = currentCollateral + selectedTotal;
  const newAvailable = availableCredit(newCollateral, debt, credit.maxLtv);
  const newLtv = ltv(debt, newCollateral);

  const toggle = (ticker: string, available: number) => {
    setSelected((prev) => {
      if (prev[ticker] != null) {
        const next = { ...prev };
        delete next[ticker];
        return next;
      }
      return { ...prev, [ticker]: Math.round(available) };
    });
  };

  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    depositCollateral(selected);
    setLoading(false);
    setOpen(false);
    setView("portfolio");
  };

  return (
    <div className="page animate-fade-in">
      <div>
        <button
          onClick={goBack}
          className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          ← Back
        </button>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Add collateral
        </h1>
      </div>

      <Card className="overflow-hidden">
        {availableAssets.map((asset) => {
          const on = selected[asset.ticker] != null;
          return (
            <div
              key={asset.ticker}
              className="border-b border-[var(--border)] px-5 py-4 last:border-0 space-y-3"
            >
              <button
                onClick={() => toggle(asset.ticker, asset.available)}
                className="flex w-full items-center gap-3 text-left"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    on
                      ? "border-[var(--lime)] bg-[var(--lime)] text-[var(--bg)]"
                      : "border-[var(--border-strong)]"
                  }`}
                >
                  {on ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{asset.ticker}</span>
                  <span className="block text-xs text-[var(--ink-muted)]">
                    {formatUsd(asset.available)} available
                  </span>
                </span>
              </button>
              {on ? (
                <input
                  type="number"
                  className="w-full rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[var(--lime)]"
                  value={Math.round(selected[asset.ticker] ?? 0)}
                  onChange={(e) =>
                    setSelected((prev) => ({
                      ...prev,
                      [asset.ticker]: Math.min(
                        asset.available,
                        Math.max(0, Number(e.target.value) || 0)
                      ),
                    }))
                  }
                />
              ) : null}
            </div>
          );
        })}
      </Card>

      <Card className="px-5 py-2">
        <StatRow label="Selected" value={formatUsd(selectedTotal)} accent />
        <StatRow label="New credit" value={formatUsd(newAvailable)} />
        <StatRow label="New LTV" value={formatPct(newLtv)} />
      </Card>

      <Button
        className="w-full"
        disabled={selectedTotal <= 0}
        onClick={() => setOpen(true)}
      >
        Review deposit
      </Button>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        loading={loading}
        title="Confirm deposit"
        description="Selected stocks will secure your credit line."
        details={[
          { label: "Deposit", value: formatUsd(selectedTotal) },
          { label: "New available credit", value: formatUsd(newAvailable) },
          { label: "New LTV", value: formatPct(newLtv) },
        ]}
        confirmLabel="Confirm deposit"
      />
    </div>
  );
}
