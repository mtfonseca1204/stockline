"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/calculations";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

type Step = "amount" | "tx" | "success";

export function Repay() {
  const { debt, gains, holdings, repayFromGains, setView } = useApp();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(
    Math.min(debt, gains, Math.max(0, Math.floor(Math.min(debt, gains))))
  );
  const [txPhase, setTxPhase] = useState(0);
  const [beforeDebt, setBeforeDebt] = useState(debt);

  const maxRepay = Math.min(debt, gains);
  const after = Math.max(0, debt - amount);
  const primary = holdings.find((h) => h.value - h.costBasis > 0) ?? holdings[0];

  const presets = useMemo(
    () =>
      [25, 50, 100]
        .map((p) => ({
          label: p === 100 ? "MAX" : `${p}%`,
          value: Math.floor((maxRepay * p) / 100),
        }))
        .filter((p, i, arr) => p.value > 0 && arr.findIndex((x) => x.value === p.value) === i),
    [maxRepay]
  );

  const run = () => {
    setBeforeDebt(debt);
    setStep("tx");
    setTxPhase(0);
    window.setTimeout(() => setTxPhase(1), 700);
    window.setTimeout(() => {
      repayFromGains(amount);
      setStep("success");
    }, 1600);
  };

  if (debt <= 0 || gains <= 0) {
    return (
      <div className="page animate-fade-up">
        <h1 className="text-2xl text-[var(--ink)]">Repay your loan</h1>
        <Card className="space-y-3">
          <p className="text-sm text-[var(--ink-muted)]">
            {debt <= 0
              ? "You don’t have an active loan."
              : "No stock gains available to apply yet."}
          </p>
          <Button className="w-full" onClick={() => setView("home")}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="page animate-fade-up relative text-center">
        <ConfettiBurst active />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <Check size={28} />
        </div>
        <h1 className="text-2xl text-[var(--ink)]">Loan repayment successful!</h1>
        <p className="mt-3 text-[15px] text-[var(--ink-muted)]">
          You used {formatUsd(amount)} of your stock gains to repay your loan.
        </p>
        <Card className="mt-6 space-y-3 text-left">
          <Row label="Previous loan" value={formatUsd(beforeDebt)} />
          <Row label="New loan" value={formatUsd(Math.max(0, beforeDebt - amount))} />
        </Card>
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => setView("home")}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  if (step === "tx") {
    const phases = ["Preparing repayment", "Applying gains", "Updating loan"];
    return (
      <div className="page animate-fade-up">
        <h1 className="text-2xl text-[var(--ink)]">Repaying</h1>
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
                    <Loader2
                      size={16}
                      className="animate-spin text-[var(--accent)]"
                    />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    active || done
                      ? "text-[var(--ink)]"
                      : "text-[var(--ink-subtle)]"
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

  return (
    <div className="page animate-fade-up">
      <button
        type="button"
        onClick={() => setView("home")}
        className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]"
      >
        <ChevronLeft size={16} /> Home
      </button>

      <h1 className="text-2xl text-[var(--ink)]">Repay your loan</h1>

      <Card className="space-y-2">
        <Row label="Current loan" value={formatUsd(debt)} />
        <Row label="Available gains" value={formatUsd(gains)} />
        <p className="pt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          Your {primary?.name ?? "stock"} collateral has increased in value. You
          can use the gained value to reduce your outstanding loan.
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl text-[var(--ink-subtle)]">$</span>
          <input
            type="number"
            min={0}
            max={maxRepay}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full bg-transparent text-4xl font-semibold outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setAmount(p.value)}
              data-selected={amount === p.value}
              className="chip rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)]"
            >
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      <Card quiet className="space-y-3">
        <Row label="Loan before" value={formatUsd(debt)} />
        <Row label="Repayment" value={formatUsd(amount)} />
        <Row label="Loan after" value={formatUsd(after)} />
      </Card>

      <Button
        size="lg"
        className="w-full"
        disabled={amount <= 0 || amount > maxRepay}
        onClick={run}
      >
        Repay {formatUsd(amount)}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <span className="font-semibold text-[var(--ink)]">{value}</span>
    </div>
  );
}
