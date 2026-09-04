"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Expandable,
  StatusPill,
} from "@/components/ui/primitives";
import { useApp } from "@/context/AppContext";
import { formatPct, formatUsd } from "@/lib/calculations";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

type Step = "amount" | "review" | "tx" | "done";

export function Borrow() {
  const {
    available,
    collateral,
    debt,
    health,
    credit,
    currentLtv,
    borrowUsdc,
    setView,
    hasPosition,
  } = useApp();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(Math.min(4000, Math.floor(available)));
  const [txPhase, setTxPhase] = useState(0);

  const afterDebt = debt + amount;
  const afterLtv = collateral > 0 ? afterDebt / collateral : 0;
  const afterStatus =
    afterLtv >= 0.48 ? "High risk" : afterLtv >= 0.38 ? "Caution" : "Healthy";

  const canContinue = amount > 0 && amount <= available + 0.01;

  const runTx = () => {
    setStep("tx");
    setTxPhase(0);
    window.setTimeout(() => setTxPhase(1), 900);
    window.setTimeout(() => setTxPhase(2), 1800);
    window.setTimeout(() => {
      borrowUsdc(amount);
      setStep("done");
    }, 2600);
  };

  const presets = useMemo(
    () =>
      [1000, 2500, 4000, Math.floor(available)]
        .filter((v, i, arr) => v > 0 && v <= available && arr.indexOf(v) === i)
        .slice(0, 4),
    [available]
  );

  if (!hasPosition || collateral <= 0) {
    return (
      <div className="page animate-fade-up">
        <h1 className="text-2xl text-[var(--ink)]">Borrow</h1>
        <Card className="space-y-3">
          <p className="font-semibold text-[var(--ink)]">No active loan</p>
          <p className="text-sm text-[var(--ink-muted)]">
            Your available credit will appear here once you add stocks.
          </p>
          <Button className="w-full" onClick={() => setView("deposit")}>
            Add stocks
          </Button>
        </Card>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="page animate-fade-up text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <Check size={28} />
        </div>
        <h1 className="text-2xl text-[var(--ink)]">Borrow complete</h1>
        <p className="mt-3 text-[15px] text-[var(--ink-muted)]">
          {formatUsd(amount)} USDC is now available.
        </p>
        <Button
          size="lg"
          className="mt-8 w-full"
          onClick={() => setView("loan")}
        >
          View loan
        </Button>
      </div>
    );
  }

  if (step === "tx") {
    const phases = [
      "Confirm transaction",
      "Supplying your stocks",
      "Creating your loan",
    ];
    return (
      <div className="page animate-fade-up">
        <h1 className="text-2xl text-[var(--ink)]">Confirm transaction</h1>
        <Card className="mt-4 space-y-4">
          {phases.map((label, i) => {
            const done = txPhase > i;
            const active = txPhase === i;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)]">
                  {done ? (
                    <Check size={16} className="text-[var(--accent)]" />
                  ) : active ? (
                    <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    active || done ? "text-[var(--ink)]" : "text-[var(--ink-subtle)]"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </Card>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="page animate-fade-up">
        <h1 className="text-2xl text-[var(--ink)]">Review your loan</h1>
        <Card className="mt-2 space-y-4">
          <ReviewRow label="You're borrowing" value={`${formatUsd(amount)} USDC`} />
          <ReviewRow label="Your stocks remain" value={formatUsd(collateral)} />
          <ReviewRow
            label="Auto-repay"
            value={credit.autoRepayEnabled ? "ON" : "OFF"}
          />
          <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
            Your stocks remain invested. Generated money can automatically be
            used to reduce your loan.
          </p>
        </Card>

        <Expandable label="Details" className="px-1">
          <DetailRow label="Current LTV" value={formatPct(afterLtv)} />
          <DetailRow label="Maximum LTV" value={formatPct(credit.maxLtv)} />
          <DetailRow
            label="Liquidation threshold"
            value={formatPct(credit.liquidationThreshold)}
          />
          <DetailRow label="Interest rate" value={formatPct(credit.interestApr)} />
          <DetailRow label="Stocks backing loan" value={formatUsd(collateral)} />
          <DetailRow label="Debt after" value={formatUsd(afterDebt)} />
        </Expandable>

        <div className="space-y-2 pt-2">
          <Button size="lg" className="w-full" onClick={runTx}>
            Borrow {formatUsd(amount)}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setStep("amount")}
          >
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-fade-up">
      <h1 className="text-2xl text-[var(--ink)]">How much do you need?</h1>

      <Card className="space-y-4">
        <label className="block">
          <span className="sr-only">Amount</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-[var(--ink-subtle)]">$</span>
            <input
              type="number"
              min={0}
              max={available}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full bg-transparent text-4xl font-semibold tracking-tight text-[var(--ink)] outline-none"
            />
            <span className="text-sm font-medium text-[var(--ink-muted)]">
              USDC
            </span>
          </div>
        </label>
        <p className="text-sm text-[var(--ink-muted)]">
          Available:{" "}
          <button
            type="button"
            className="font-semibold text-[var(--accent)]"
            onClick={() => setAmount(Math.floor(available))}
          >
            {formatUsd(available)}
          </button>
        </p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)] hover:border-[var(--border-strong)]"
            >
              {formatUsd(p)}
            </button>
          ))}
        </div>
      </Card>

      <Card quiet className="space-y-3">
        <p className="text-sm font-semibold text-[var(--ink)]">After borrowing</p>
        <ReviewRow label="Portfolio value" value={formatUsd(collateral)} />
        <ReviewRow label="Loan" value={formatUsd(afterDebt)} />
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--ink-muted)]">Status</span>
          <StatusPill status={afterStatus} />
        </div>
      </Card>

      <AnimatePresence>
        {!canContinue && amount > available ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[var(--danger)]"
          >
            That’s more than you can safely access right now.
          </motion.p>
        ) : null}
      </AnimatePresence>

      <Button
        size="lg"
        className="w-full"
        disabled={!canContinue}
        onClick={() => setStep("review")}
      >
        Continue
      </Button>

      {debt > 0 ? (
        <Button variant="ghost" className="w-full" onClick={() => setView("loan")}>
          View current loan
        </Button>
      ) : null}

      {/* silence unused */}
      <span className="sr-only">{health.status} {formatPct(currentLtv)}</span>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-[var(--ink-muted)]">{label}</span>
      <span className="text-right text-sm font-semibold text-[var(--ink)]">
        {value}
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span>{label}</span>
      <span className="font-medium text-[var(--ink)]">{value}</span>
    </div>
  );
}
