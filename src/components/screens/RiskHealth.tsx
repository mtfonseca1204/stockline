"use client";

import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Tooltip";
import { useApp } from "@/context/AppContext";
import { formatPct, formatUsd, ltv, safetyBuffer } from "@/lib/calculations";

export function RiskHealth() {
  const { health, currentLtv, credit, collateral, debt, setView, goBack } =
    useApp();
  const buffer = safetyBuffer(currentLtv, credit.liquidationThreshold);

  const scenarios = [
    { drop: 0.1, label: "−10%" },
    { drop: 0.25, label: "−25%" },
    { drop: 0.4, label: "−40%" },
  ].map((s) => {
    const value = collateral * (1 - s.drop);
    const nextLtv = ltv(debt, value);
    let status: "Healthy" | "Caution" | "High risk" = "Healthy";
    if (nextLtv >= 0.48) status = "High risk";
    else if (nextLtv >= 0.38) status = "Caution";
    return { ...s, value, nextLtv, status };
  });

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-8 sm:px-6 animate-fade-in">
      <button
        onClick={goBack}
        className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
      >
        ← Back
      </button>

      <Card className="p-8 text-center space-y-2">
        <p className="text-5xl font-semibold text-[var(--lime)]">{health.overall}</p>
        <p className="text-sm text-[var(--ink-muted)]">
          Health · {health.status}
        </p>
      </Card>

      <Card className="px-5">
        <StatRow label="LTV" value={formatPct(currentLtv)} />
        <StatRow
          label="Liquidation at"
          value={formatPct(credit.liquidationThreshold)}
        />
        <StatRow label="Buffer" value={formatPct(buffer)} accent />
      </Card>

      <p className="text-sm font-semibold">If markets fall</p>
      {scenarios.map((s) => (
        <Card key={s.label} className="p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{s.label}</p>
            <Badge
              tone={
                s.status === "Healthy"
                  ? "green"
                  : s.status === "Caution"
                    ? "amber"
                    : "red"
              }
            >
              {s.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {formatUsd(s.value)} · LTV {formatPct(s.nextLtv)}
          </p>
        </Card>
      ))}

      <Button className="w-full" onClick={() => setView("deposit")}>
        Add collateral
      </Button>
    </div>
  );
}
