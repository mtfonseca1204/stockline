"use client";

import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LtvMeter } from "@/components/ui/Meters";
import { useApp } from "@/context/AppContext";
import {
  formatPct,
  formatUsd,
  ltv,
  maxSafeBorrow,
} from "@/lib/calculations";
import { useState } from "react";

export function BorrowFlow() {
  const {
    collateral,
    debt,
    available,
    credit,
    borrowUsdc,
    setView,
    goBack,
  } = useApp();

  const maxBorrow = maxSafeBorrow(collateral, debt, credit.maxLtv);
  const [amount, setAmount] = useState(Math.min(4000, Math.max(0, maxBorrow)));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const afterLtv = ltv(debt + amount, collateral);

  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    borrowUsdc(amount);
    setLoading(false);
    setOpen(false);
    setView("credit");
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
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Borrow USDC</h1>
      </div>

      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">Amount</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold">$</span>
            <input
              type="number"
              value={Math.round(amount)}
              onChange={(e) =>
                setAmount(
                  Math.min(maxBorrow, Math.max(0, Number(e.target.value) || 0))
                )
              }
              className="w-full bg-transparent text-3xl font-semibold outline-none"
            />
          </div>
          <div className="mt-3 flex gap-2">
            {[0.25, 0.5, 1].map((p) => (
              <Button
                key={p}
                size="sm"
                variant="ghost"
                onClick={() => setAmount(Math.round(maxBorrow * p))}
              >
                {p === 1 ? "Max" : `${p * 100}%`}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <StatRow label="Available" value={formatUsd(available)} accent />
          <StatRow label="LTV after" value={formatPct(afterLtv)} />
          <StatRow
            label="Interest"
            value={`${(credit.interestApr * 100).toFixed(1)}% APR`}
          />
        </div>

        <LtvMeter currentLtv={afterLtv} maxLtv={credit.maxLtv} />

        <Button
          className="w-full"
          disabled={amount <= 0}
          onClick={() => setOpen(true)}
        >
          Review borrow
        </Button>
      </Card>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        loading={loading}
        title="Confirm borrow"
        description="Your stocks stay invested while securing this loan."
        details={[
          { label: "Borrow", value: `${formatUsd(amount)} USDC` },
          { label: "Collateral", value: formatUsd(collateral) },
          { label: "LTV after", value: formatPct(afterLtv) },
          {
            label: "Interest",
            value: `${(credit.interestApr * 100).toFixed(1)}% APR`,
          },
        ]}
        confirmLabel="Confirm borrow"
      />
    </div>
  );
}
