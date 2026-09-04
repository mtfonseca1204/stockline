"use client";

import { AutoRepaySheet } from "@/components/sheets/AutoRepaySheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Expandable, ProgressBar } from "@/components/ui/primitives";
import { useApp } from "@/context/AppContext";
import { formatPct, formatUsd } from "@/lib/calculations";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

export function LoanDetail() {
  const {
    debt,
    credit,
    collateral,
    yieldMonthly,
    currentLtv,
    setView,
    lastYieldPulse,
    clearYieldPulse,
  } = useApp();
  const [autoOpen, setAutoOpen] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (lastYieldPulse == null) return;
    setFlash(true);
    const t = setTimeout(() => {
      setFlash(false);
      clearYieldPulse();
    }, 1400);
    return () => clearTimeout(t);
  }, [lastYieldPulse, clearYieldPulse]);

  if (debt <= 0 && credit.originalDebt <= 0) {
    return (
      <div className="page animate-fade-up">
        <button
          type="button"
          onClick={() => setView("home")}
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]"
        >
          <ChevronLeft size={16} /> Home
        </button>
        <Card className="mt-4 space-y-3">
          <p className="font-semibold text-[var(--ink)]">No active loan</p>
          <p className="text-sm text-[var(--ink-muted)]">
            Borrow USDC when you’re ready — your stocks stay invested.
          </p>
          <Button className="w-full" onClick={() => setView("borrow")}>
            Borrow USDC
          </Button>
        </Card>
      </div>
    );
  }

  const repaid = Math.max(0, credit.originalDebt - debt);
  const progress =
    credit.originalDebt > 0 ? (repaid / credit.originalDebt) * 100 : 0;

  return (
    <div className="page animate-fade-up">
      <button
        type="button"
        onClick={() => setView("home")}
        className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]"
      >
        <ChevronLeft size={16} /> Home
      </button>

      <div className={flash ? "animate-debt-flash rounded-xl p-1" : ""}>
        <p className="text-sm text-[var(--ink-muted)]">Your loan</p>
        <p className="mt-1 text-4xl font-semibold text-[var(--ink)]">
          {formatUsd(debt)}
        </p>
        <p className="text-sm text-[var(--ink-subtle)]">remaining</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[var(--ink-subtle)]">
          <span>{formatUsd(repaid)} repaid</span>
          <span>{formatUsd(credit.originalDebt)} original</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-[var(--ink)]">
            Auto-repay {credit.autoRepayEnabled ? "ON" : "OFF"}
          </p>
          <button
            type="button"
            className="text-sm font-medium text-[var(--accent)]"
            onClick={() => setAutoOpen(true)}
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-[var(--ink-muted)]">
          {formatUsd(credit.yieldGeneratedMonth || yieldMonthly)} generated
        </p>
        <p className="text-sm text-[var(--ink-muted)]">
          {formatUsd(
            credit.yieldAppliedMonth ||
              (credit.autoRepayEnabled
                ? Math.round(yieldMonthly * (credit.autoRepayPercent / 100))
                : 0)
          )}{" "}
          applied
        </p>
      </Card>

      <Card quiet>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--ink-muted)]">Your stocks</span>
          <span className="font-semibold text-[var(--ink)]">
            {formatUsd(collateral)}
          </span>
        </div>
      </Card>

      <Expandable label="Advanced details">
        <div className="flex justify-between">
          <span>Current LTV</span>
          <span className="font-medium text-[var(--ink)]">
            {formatPct(currentLtv)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Maximum LTV</span>
          <span className="font-medium text-[var(--ink)]">
            {formatPct(credit.maxLtv)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Interest rate</span>
          <span className="font-medium text-[var(--ink)]">
            {formatPct(credit.interestApr)}
          </span>
        </div>
      </Expandable>

      <Button
        size="lg"
        className="w-full"
        onClick={() => {
          /* demo: jump to borrow tab messaging — repay via yield sim */
          setView("home");
        }}
      >
        Repay
      </Button>
      <p className="text-center text-xs text-[var(--ink-subtle)]">
        In demo, use “+$100 → repay” to watch the loan decrease.
      </p>

      <AutoRepaySheet open={autoOpen} onClose={() => setAutoOpen(false)} />
    </div>
  );
}
