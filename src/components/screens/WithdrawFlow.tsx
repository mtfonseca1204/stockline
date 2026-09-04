"use client";

import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useApp } from "@/context/AppContext";
import { formatPct, formatUsd, ltv } from "@/lib/calculations";
import { useMemo, useState } from "react";

export function WithdrawFlow() {
  const { collateral, debt, credit, withdrawCollateral, goBack, setView } =
    useApp();
  const [amount, setAmount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const maxWithdraw = useMemo(() => {
    const safeLtv = credit.maxLtv * 0.8;
    if (debt <= 0) return collateral;
    const minCollateral = debt / safeLtv;
    return Math.max(0, collateral - minCollateral);
  }, [collateral, debt, credit.maxLtv]);

  const remainingCollateral = collateral - amount;
  const resultingLtv = ltv(debt, remainingCollateral);
  const safe = amount <= maxWithdraw + 0.01 && resultingLtv < credit.maxLtv;

  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    withdrawCollateral(amount);
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
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Withdraw collateral
        </h1>
      </div>

      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <StatRow label="Collateral" value={formatUsd(collateral)} />
          <StatRow label="Debt" value={formatUsd(debt)} />
          <StatRow label="Available" value={formatUsd(maxWithdraw)} accent />
        </div>

        <div>
          <p className="text-sm text-[var(--ink-muted)]">Withdraw amount</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold">$</span>
            <input
              type="number"
              value={Math.round(amount)}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-transparent text-3xl font-semibold outline-none"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAmount(Math.round(maxWithdraw * 0.5))}
            >
              50%
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAmount(Math.round(maxWithdraw))}
            >
              Max safe
            </Button>
          </div>
        </div>

        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            safe
              ? "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]"
              : "border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]"
          }`}
        >
          {safe
            ? `Withdrawal available · LTV ${formatPct(resultingLtv)}`
            : "Withdrawal unavailable — would exceed safe LTV"}
        </div>

        <Button
          className="w-full"
          disabled={!safe || amount <= 0}
          onClick={() => setOpen(true)}
        >
          Review withdraw
        </Button>
      </Card>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        loading={loading}
        title="Confirm withdraw"
        description="Only collateral that keeps your loan safely backed will be released."
        details={[
          { label: "Withdraw", value: formatUsd(amount) },
          { label: "Remaining collateral", value: formatUsd(remainingCollateral) },
          { label: "LTV after", value: formatPct(resultingLtv) },
        ]}
        confirmLabel="Confirm withdraw"
      />
    </div>
  );
}
