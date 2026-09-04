"use client";

import { formatPct } from "@/lib/calculations";

export function LtvMeter({
  currentLtv,
  maxLtv = 0.55,
}: {
  currentLtv: number;
  maxLtv?: number;
  showLabels?: boolean;
}) {
  const pct = Math.min(100, (currentLtv / maxLtv) * 100);

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--lime)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--ink-subtle)]">
        <span>LTV {formatPct(currentLtv)}</span>
        <span>Max {formatPct(maxLtv)}</span>
      </div>
    </div>
  );
}

export function FlowSteps({
  steps,
}: {
  steps: Array<{ label: string; value?: string }>;
}) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-col items-center">
          <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-center">
            <p className="text-sm font-medium">{step.label}</p>
            {step.value ? (
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{step.value}</p>
            ) : null}
          </div>
          {i < steps.length - 1 ? (
            <div className="my-1 h-3 w-px bg-[var(--border-strong)]" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function RiskMeter({ score }: { score: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-28 w-28 items-center justify-center rounded-full border-[8px] border-[var(--lime)]">
        <div className="text-center">
          <p className="text-3xl font-semibold">{score}</p>
          <p className="text-xs text-[var(--ink-muted)]">/ 100</p>
        </div>
      </div>
    </div>
  );
}
