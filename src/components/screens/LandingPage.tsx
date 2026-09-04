"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";

export function LandingPage({ onConnect }: { onConnect: () => void }) {
  const { enableDemoMode } = useApp();

  return (
    <div className="page min-h-[calc(100vh-3.5rem)] justify-center animate-fade-in">
      <div>
        <p className="mb-3 text-sm font-semibold text-[var(--lime)]">
          Credit on Base
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]">
          Borrow against stocks.
          <br />
          Keep them invested.
        </h1>
        <p className="mt-4 text-[var(--ink-muted)] leading-relaxed">
          Deposit tokenized stocks, borrow USDC, and let yield help repay your
          loan.
        </p>
      </div>

      <Card className="p-6 space-y-3">
        <p className="text-sm text-[var(--ink-muted)]">Net worth</p>
        <p className="text-4xl font-semibold tracking-tight">$25,480</p>
        <div className="flex justify-between text-sm pt-1">
          <span className="text-[var(--ink-muted)]">Available</span>
          <span className="font-semibold text-[var(--lime)]">$10,014</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--ink-muted)]">Debt</span>
          <span className="font-semibold">$4,000</span>
        </div>
      </Card>

      <div className="space-y-3">
        <Button size="lg" className="w-full" onClick={onConnect}>
          Start borrowing
        </Button>
        <button
          onClick={enableDemoMode}
          className="w-full text-center text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          Enter Demo Mode
        </button>
      </div>
    </div>
  );
}
