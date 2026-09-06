"use client";

import { StockLogo } from "@/components/brand/StockLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/calculations";

export function Home() {
  const {
    collateral,
    debt,
    available,
    gains,
    holdings,
    setView,
    simulateAppreciation,
  } = useApp();

  const empty = collateral <= 0;

  // STATE 1 — empty
  if (empty) {
    return (
      <div className="page animate-fade-up">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">Your Portfolio</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--ink)]">
            $0.00
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
            Get started by adding tokenized stocks as collateral.
          </p>
        </div>

        <Card className="space-y-3">
          <h2 className="text-lg text-[var(--ink)]">Add Collateral</h2>
          <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
            Add your tokenized stocks to unlock borrowing power.
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => setView("deposit")}
          >
            Add Collateral
          </Button>
        </Card>
      </div>
    );
  }

  // STATE 4 — appreciation with active loan
  const showRepayCard = debt > 0 && gains > 0;
  // STATE 2 — collateral, no loan
  const showBorrowCard = debt <= 0;
  // STATE 3 — active loan, no gains yet
  const showLoanSummary = debt > 0 && !showRepayCard;

  return (
    <div className="page animate-fade-up">
      <div>
        <p className="text-sm text-[var(--ink-muted)]">Your Portfolio</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--ink)]">
          {formatUsd(collateral)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric label="Collateral" value={formatUsd(collateral)} />
        <Metric label="Borrowed" value={formatUsd(debt)} />
        <Metric label="Available" value={formatUsd(available)} />
      </div>

      {showRepayCard ? (
        <Card className="space-y-3 ring-1 ring-[var(--accent)]">
          <h2 className="text-lg text-[var(--ink)]">
            Your stocks have gained value
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Your collateral has increased by{" "}
            <span className="font-semibold text-[var(--accent)]">
              +{formatUsd(gains)}
            </span>
            . You can use part of this value to repay your loan.
          </p>
          <Button size="lg" className="w-full" onClick={() => setView("repay")}>
            Repay your loan
          </Button>
        </Card>
      ) : null}

      {showBorrowCard ? (
        <Card className="space-y-3">
          <h2 className="text-lg text-[var(--ink)]">Borrow USDC</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Available to borrow:{" "}
            <span className="font-semibold text-[var(--ink)]">
              {formatUsd(available)}
            </span>
          </p>
          <p className="text-sm text-[var(--ink-muted)]">
            Access liquidity without selling your stocks.
          </p>
          <Button
            size="lg"
            className="w-full"
            disabled={available < 1}
            onClick={() => setView("borrow")}
          >
            Borrow
          </Button>
        </Card>
      ) : null}

      {showLoanSummary ? (
        <Card className="space-y-3">
          <h2 className="text-lg text-[var(--ink)]">Your loan</h2>
          <p className="text-3xl font-semibold text-[var(--ink)]">
            {formatUsd(debt)}
          </p>
          <p className="text-sm text-[var(--ink-muted)]">
            Your stocks remain deposited while your loan is active.
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => setView("borrow")}
              disabled={available < 1}
            >
              Borrow more
            </Button>
            <Button
              className="flex-1"
              variant="ghost"
              onClick={() => simulateAppreciation(200)}
            >
              Stocks rose +$200
            </Button>
          </div>
          <p className="text-xs text-[var(--ink-subtle)]">
            Simulate appreciation to unlock repayment with gains.
          </p>
        </Card>
      ) : null}

      <button
        type="button"
        onClick={() => setView("portfolio")}
        className="text-sm font-medium text-[var(--accent)]"
      >
        View portfolio
      </button>

      {holdings.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {holdings.map((h) => (
            <div
              key={h.ticker}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-2.5 py-1.5 text-xs"
            >
              <StockLogo ticker={h.ticker} size={20} />
              <span className="font-semibold text-[var(--ink)]">{h.ticker}</span>
              <span className="text-[var(--ink-muted)]">{formatUsd(h.value)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-quiet flex flex-col gap-1 p-3">
      <span className="text-[11px] text-[var(--ink-subtle)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--ink)]">{value}</span>
    </div>
  );
}
