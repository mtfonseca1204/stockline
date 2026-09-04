"use client";

import { DemoPanel } from "@/components/demo/DemoPanel";
import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { LtvMeter } from "@/components/ui/Meters";
import { useApp } from "@/context/AppContext";
import {
  formatSignedUsd,
  formatUsd,
  greeting,
} from "@/lib/calculations";

export function Dashboard() {
  const {
    collateral,
    available,
    debt,
    health,
    currentLtv,
    credit,
    yieldMonthly,
    repayMonthly,
    payoffMonths,
    setView,
  } = useApp();

  return (
    <div className="page animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting()}</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Health {health.overall} · {health.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setView("deposit")}>
            Supply
          </Button>
          <Button size="sm" onClick={() => setView("borrow")}>
            Borrow
          </Button>
        </div>
      </div>

      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">Portfolio</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">
            {formatUsd(collateral)}
          </p>
        </div>

        <div className="space-y-0">
          <StatRow label="Available to borrow" value={formatUsd(available)} accent />
          <StatRow label="Debt" value={formatUsd(debt)} />
          <StatRow
            label="Monthly repayment"
            value={
              credit.autoRepayEnabled ? `−${formatUsd(repayMonthly)}` : "Off"
            }
          />
        </div>

        <LtvMeter currentLtv={currentLtv} maxLtv={credit.maxLtv} />

        <div className="rounded-2xl border border-[var(--border)] bg-white/[0.03] p-4 space-y-3">
          <p className="text-sm font-semibold">Self-repaying</p>
          <p className="text-sm text-[var(--ink-muted)]">
            Yield {formatSignedUsd(yieldMonthly)}/mo
            {payoffMonths ? ` · ~${payoffMonths} mo to clear` : ""}
          </p>
          <Button variant="soft" className="w-full" onClick={() => setView("credit")}>
            View credit
          </Button>
        </div>
      </Card>

      <DemoPanel />
    </div>
  );
}
