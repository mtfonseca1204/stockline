"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/calculations";
import { ChevronLeft } from "lucide-react";

export function LoanDetail() {
  const { debt, credit, collateral, available, gains, setView } = useApp();

  if (debt <= 0 && credit.originalDebt <= 0) {
    return (
      <div className="page animate-fade-up">
        <button
          type="button"
          onClick={() => setView("home")}
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]"
        >
          <ChevronLeft size={16} /> Home
        </button>
        <Card className="mt-4 space-y-3">
          <p className="font-semibold text-[var(--ink)]">No active loan</p>
          <p className="text-sm text-[var(--ink-muted)]">
            Borrow USDC when you’re ready — your stocks stay deposited.
          </p>
          <Button className="w-full" onClick={() => setView("borrow")}>
            Borrow USDC
          </Button>
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

      <div>
        <p className="text-sm text-[var(--ink-muted)]">Your loan</p>
        <p className="mt-1 text-4xl font-semibold text-[var(--ink)]">
          {formatUsd(debt)}
        </p>
      </div>

      <Card quiet className="space-y-3">
        <Row label="Collateral" value={formatUsd(collateral)} />
        <Row label="Available to borrow" value={formatUsd(available)} />
        {gains > 0 ? (
          <Row label="Unrealized gains" value={`+${formatUsd(gains)}`} />
        ) : null}
      </Card>

      {gains > 0 && debt > 0 ? (
        <Button size="lg" className="w-full" onClick={() => setView("repay")}>
          Repay your loan
        </Button>
      ) : (
        <Button
          size="lg"
          className="w-full"
          disabled={available < 1}
          onClick={() => setView("borrow")}
        >
          Borrow more
        </Button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <span className="font-semibold text-[var(--ink)]">{value}</span>
    </div>
  );
}
