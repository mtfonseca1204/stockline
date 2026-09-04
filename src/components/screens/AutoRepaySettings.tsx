"use client";

import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useApp } from "@/context/AppContext";
import {
  formatUsd,
  monthlyRepayment,
  projectedPayoffMonths,
} from "@/lib/calculations";
import { cn } from "@/lib/cn";
import { useState } from "react";

const OPTIONS = [
  { value: 100, title: "100%", desc: "All yield to debt" },
  { value: 75, title: "75%", desc: "Most yield to debt" },
  { value: 50, title: "50%", desc: "Split with balance" },
  { value: -1, title: "Custom", desc: "Choose your %" },
];

export function AutoRepaySettings() {
  const { credit, yieldMonthly, debt, setAutoRepay, setView, goBack } =
    useApp();
  const [choice, setChoice] = useState(
    [100, 75, 50].includes(credit.autoRepayPercent)
      ? credit.autoRepayPercent
      : -1
  );
  const [custom, setCustom] = useState(60);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const percent = choice === -1 ? custom : choice;
  const repay = monthlyRepayment(yieldMonthly, percent);
  const payoff = projectedPayoffMonths(debt, repay);

  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setAutoRepay(true, percent);
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
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Auto-Repay</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          How much yield should repay your loan?
        </p>
      </div>

      <Card className="overflow-hidden">
        {OPTIONS.map((opt) => (
          <button
            key={opt.title}
            onClick={() => setChoice(opt.value)}
            className={cn(
              "w-full border-b border-[var(--border)] px-5 py-4 text-left last:border-0 transition",
              choice === opt.value && "bg-[var(--lime-soft)]"
            )}
          >
            <p className="font-semibold">{opt.title}</p>
            <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{opt.desc}</p>
          </button>
        ))}
      </Card>

      {choice === -1 ? (
        <Card className="p-5 space-y-3">
          <p className="text-sm text-[var(--ink-muted)]">Custom: {custom}%</p>
          <div className="flex flex-wrap gap-2">
            {[25, 40, 60, 80, 90].map((v) => (
              <Button
                key={v}
                size="sm"
                variant={custom === v ? "primary" : "ghost"}
                onClick={() => setCustom(v)}
              >
                {v}%
              </Button>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="px-5 py-2">
        <StatRow label="Monthly yield" value={formatUsd(yieldMonthly)} />
        <StatRow label="Repayment" value={formatUsd(repay)} accent />
        <StatRow
          label="Est. payoff"
          value={payoff ? `${payoff} months` : "—"}
        />
      </Card>

      <Button className="w-full" onClick={() => setOpen(true)}>
        Review Auto-Repay
      </Button>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        loading={loading}
        title="Enable Auto-Repay?"
        description={`${percent}% of generated yield will go toward your debt.`}
        details={[
          { label: "Share", value: `${percent}%` },
          { label: "Monthly repayment", value: formatUsd(repay) },
          { label: "Est. payoff", value: payoff ? `${payoff} months` : "—" },
        ]}
        confirmLabel="Enable Auto-Repay"
      />
    </div>
  );
}
