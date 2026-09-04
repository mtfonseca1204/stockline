"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";

export function DemoPanel() {
  const {
    demoMode,
    simulateGrowth,
    simulateYield,
    enableDemoMode,
    resetToEmpty,
  } = useApp();

  return (
    <Card className="border-[var(--lime)]/25 bg-[var(--lime-soft)] p-4 space-y-3">
      <p className="text-xs font-semibold text-[var(--lime)]">Demo</p>
      {!demoMode ? (
        <Button size="sm" variant="soft" onClick={enableDemoMode}>
          Load demo
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => simulateGrowth(0.1)}>
            +10%
          </Button>
          <Button size="sm" onClick={() => simulateYield(100)}>
            +$100 yield
          </Button>
          <Button size="sm" variant="ghost" onClick={resetToEmpty}>
            Reset
          </Button>
        </div>
      )}
    </Card>
  );
}
