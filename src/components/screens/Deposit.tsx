"use client";

import { StockLogo } from "@/components/brand/StockLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { ResultPopup } from "@/components/ui/ResultPopup";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/calculations";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

type Step = "select" | "amount" | "tx" | "success";

const PERCENTS = [25, 50, 75, 100] as const;

export function Deposit() {
  const { walletAssets, depositCollateral, setView } = useApp();
  const [step, setStep] = useState<Step>("select");
  const [ticker, setTicker] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [txPhase, setTxPhase] = useState(0);
  const [fail, setFail] = useState(false);

  const asset = walletAssets.find((a) => a.ticker === ticker);
  const available = asset?.available ?? 0;

  const presets = useMemo(
    () =>
      PERCENTS.map((p) => ({
        label: p === 100 ? "MAX" : `${p}%`,
        value: Math.floor((available * p) / 100),
      })).filter((p) => p.value > 0),
    [available]
  );

  const startDeposit = () => {
    if (!ticker || amount <= 0 || amount > available + 0.01) {
      setFail(true);
      return;
    }
    setStep("tx");
    setTxPhase(0);
    window.setTimeout(() => setTxPhase(1), 700);
    window.setTimeout(() => setTxPhase(2), 1400);
    window.setTimeout(() => {
      depositCollateral(ticker, amount);
      setStep("success");
    }, 2200);
  };

  if (step === "success" && asset) {
    return (
      <div className="page animate-fade-up relative text-center">
        <ConfettiBurst active />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <Check size={28} />
        </div>
        <h1 className="text-2xl text-[var(--ink)]">Collateral added!</h1>
        <p className="mt-3 text-[15px] text-[var(--ink-muted)]">
          Your stocks are now deposited and earning value while backing your
          credit.
        </p>
        <Card className="mt-6 space-y-3 text-left">
          <div className="flex items-center gap-3">
            <StockLogo ticker={asset.ticker} size={40} />
            <div>
              <p className="text-sm text-[var(--ink-muted)]">
                Collateral deposited
              </p>
              <p className="text-xl font-semibold text-[var(--ink)]">
                {formatUsd(amount)} {asset.name}
              </p>
            </div>
          </div>
        </Card>
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => setView("home")}
        >
          Back to Home
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setView("portfolio")}
        >
          View Portfolio
        </Button>
      </div>
    );
  }

  if (step === "tx") {
    const phases = [
      "Preparing transaction",
      "Depositing stocks",
      "Confirming collateral",
    ];
    return (
      <div className="page animate-fade-up">
        <h1 className="text-2xl text-[var(--ink)]">Depositing</h1>
        <Card className="mt-4 space-y-4">
          {phases.map((label, i) => {
            const done = txPhase > i;
            const active = txPhase === i;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)]">
                  {done ? (
                    <Check size={16} className="text-[var(--accent)]" />
                  ) : active ? (
                    <Loader2
                      size={16}
                      className="animate-spin text-[var(--accent)]"
                    />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    active || done
                      ? "text-[var(--ink)]"
                      : "text-[var(--ink-subtle)]"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </Card>
      </div>
    );
  }

  if (step === "amount" && asset) {
    return (
      <div className="page animate-fade-up">
        <button
          type="button"
          onClick={() => setStep("select")}
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3">
          <StockLogo ticker={asset.ticker} size={48} />
          <div>
            <h1 className="text-2xl text-[var(--ink)]">{asset.name}</h1>
            <p className="text-sm text-[var(--ink-muted)]">{asset.ticker}</p>
          </div>
        </div>

        <Card className="space-y-4">
          <p className="text-sm text-[var(--ink-muted)]">
            Available:{" "}
            <button
              type="button"
              className="font-semibold text-[var(--accent)]"
              onClick={() => setAmount(available)}
            >
              {formatUsd(available)}
            </button>
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-[var(--ink-subtle)]">$</span>
            <input
              type="number"
              min={0}
              max={available}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full bg-transparent text-4xl font-semibold outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setAmount(p.value)}
                data-selected={amount === p.value}
                className="chip rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </Card>

        <Card quiet className="space-y-1">
          <p className="text-sm text-[var(--ink-muted)]">You are depositing</p>
          <p className="text-lg font-semibold text-[var(--ink)]">
            {formatUsd(amount)} {asset.name}
          </p>
        </Card>

        <Button
          size="lg"
          className="w-full"
          disabled={amount <= 0 || amount > available}
          onClick={startDeposit}
        >
          Deposit Collateral
        </Button>

        <ResultPopup
          open={fail}
          status="fail"
          title="Deposit failed"
          message="Check the amount and try again."
          primaryLabel="Try again"
          onPrimary={() => setFail(false)}
        />
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
        <h1 className="text-2xl text-[var(--ink)]">Add Collateral</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Select the stocks you want to use as collateral.
        </p>
      </div>

      <div className="surface overflow-hidden">
        {walletAssets.map((a, i) => (
          <button
            key={a.ticker}
            type="button"
            disabled={a.available <= 0}
            onClick={() => {
              setTicker(a.ticker);
              setAmount(Math.min(500, a.available));
              setStep("amount");
            }}
            className={`interactive-row flex w-full items-center gap-3 px-4 py-3.5 text-left disabled:opacity-40 ${
              i > 0 ? "border-t border-[var(--border)]" : ""
            }`}
          >
            <StockLogo ticker={a.ticker} size={40} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--ink)]">{a.name}</p>
              <p className="text-xs text-[var(--ink-muted)]">{a.ticker}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[var(--ink-subtle)]">Available</p>
              <p className="font-semibold text-[var(--ink)]">
                {formatUsd(a.available)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
