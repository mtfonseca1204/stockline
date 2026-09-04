"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";

export function EmptyState() {
  const { setView, enableDemoMode } = useApp();

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center gap-5 px-4 py-20 animate-fade-in sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Supply collateral</h1>
      <p className="text-[var(--ink-muted)]">
        Deposit tokenized stocks to unlock a credit line.
      </p>
      <Button size="lg" onClick={() => setView("deposit")}>
        Deposit stocks
      </Button>
      <Card className="space-y-3 p-5">
        <p className="text-sm text-[var(--ink-muted)]">Need a filled demo?</p>
        <Button variant="soft" onClick={enableDemoMode}>
          Enter Demo Mode
        </Button>
      </Card>
    </div>
  );
}
