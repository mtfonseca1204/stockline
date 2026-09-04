"use client";

import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LtvMeter } from "@/components/ui/Meters";
import { useApp } from "@/context/AppContext";
import { formatSignedUsd, formatUsd } from "@/lib/calculations";
import { useState } from "react";

export function CreditPosition() {
  const {
    collateral,
    debt,
    yieldMonthly,
    repayMonthly,
    payoffMonths,
    credit,
    currentLtv,
    setView,
    setAutoRepay,
  } = useApp();

  const [confirm, setConfirm] = useState<"on" | "off" | null>(null);
  const [loading, setLoading] = useState(false);

  const runToggle = async () => {
    if (!confirm) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setAutoRepay(confirm === "on", credit.autoRepayPercent);
    setLoading(false);
    setConfirm(null);
  };

  return (
    <div className="page animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Credit</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Your loan and how it gets repaid.
        </p>
      </div>

      <Card className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[var(--ink-muted)]">Collateral</p>
            <p className="mt-1 text-2xl font-semibold">{formatUsd(collateral)}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--ink-muted)]">Debt</p>
            <p className="mt-1 text-2xl font-semibold">{formatUsd(debt)}</p>
          </div>
        </div>

        <LtvMeter currentLtv={currentLtv} maxLtv={credit.maxLtv} />

        <div>
          <StatRow
            label="Yield"
            value={`${formatSignedUsd(yieldMonthly)}/mo`}
            accent
          />
          <StatRow
            label="Auto-repay"
            value={
              credit.autoRepayEnabled
                ? `−${formatUsd(repayMonthly)}/mo`
                : "Off"
            }
          />
          <StatRow
            label="Est. payoff"
            value={payoffMonths ? `${payoffMonths} months` : "—"}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white/[0.03] p-4">
          <div>
            <p className="font-semibold">Auto-Repay</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Send yield to debt automatically.
            </p>
          </div>
          <button
            onClick={() =>
              setConfirm(credit.autoRepayEnabled ? "off" : "on")
            }
            className={`relative h-8 w-12 rounded-full transition ${
              credit.autoRepayEnabled
                ? "bg-[var(--lime)]"
                : "bg-[var(--border-strong)]"
            }`}
            aria-label="Toggle auto-repay"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-[var(--bg)] transition ${
                credit.autoRepayEnabled ? "left-[22px]" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => setView("borrow")}>
            Borrow more
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setView("withdraw")}
          >
            Withdraw
          </Button>
        </div>

        <Button variant="ghost" className="w-full" onClick={() => setView("auto-repay")}>
          Adjust %
        </Button>
      </Card>

      <ConfirmModal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={runToggle}
        loading={loading}
        title={confirm === "on" ? "Enable Auto-Repay?" : "Turn off Auto-Repay?"}
        description={
          confirm === "on"
            ? "Yield from your stocks will be applied to your outstanding debt."
            : "Yield will stay available to you instead of paying down debt."
        }
        details={[
          { label: "Debt", value: formatUsd(debt) },
          {
            label: "Share",
            value: `${credit.autoRepayPercent}%`,
          },
        ]}
        confirmLabel={confirm === "on" ? "Enable" : "Turn off"}
      />
    </div>
  );
}
