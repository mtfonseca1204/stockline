"use client";

import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/calculations";

/** Compact presenter controls — doesn’t dominate the UI */
export function DemoBar({ onReplayOnboarding }: { onReplayOnboarding?: () => void }) {
  const {
    demoMode,
    debt,
    simulateYield,
    simulateGrowth,
    enableDemoMode,
    resetToEmpty,
  } = useApp();

  if (!demoMode) return null;

  return (
    <div className="fixed bottom-[4.75rem] left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-[var(--border)] bg-white/95 p-2 shadow-lg backdrop-blur md:bottom-24">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-subtle)]">
          Demo
        </span>
        <Button
          size="sm"
          variant="soft"
          onClick={() => simulateYield(100)}
          disabled={debt <= 0}
        >
          +$100 → repay
        </Button>
        <Button size="sm" variant="secondary" onClick={() => simulateGrowth(0.1)}>
          +10% stocks
        </Button>
        <Button size="sm" variant="ghost" onClick={resetToEmpty}>
          Reset
        </Button>
        <Button size="sm" variant="ghost" onClick={enableDemoMode}>
          Reload
        </Button>
        {onReplayOnboarding ? (
          <Button size="sm" variant="ghost" onClick={onReplayOnboarding}>
            Onboarding
          </Button>
        ) : null}
        <span className="ml-auto px-1 text-[11px] text-[var(--ink-subtle)]">
          Loan {formatUsd(debt)}
        </span>
      </div>
    </div>
  );
}
