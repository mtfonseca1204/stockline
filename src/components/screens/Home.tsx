"use client";

import { AutoRepaySheet } from "@/components/sheets/AutoRepaySheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Expandable,
  ProgressBar,
  StatusPill,
} from "@/components/ui/primitives";
import { useApp } from "@/context/AppContext";
import { formatPct, formatUsd } from "@/lib/calculations";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Home() {
  const {
    hasPosition,
    collateral,
    debt,
    available,
    health,
    credit,
    yieldMonthly,
    currentLtv,
    setView,
    lastYieldPulse,
    clearYieldPulse,
  } = useApp();
  const [autoOpen, setAutoOpen] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (lastYieldPulse == null) return;
    setFlash(true);
    const t = setTimeout(() => {
      setFlash(false);
      clearYieldPulse();
    }, 1400);
    return () => clearTimeout(t);
  }, [lastYieldPulse, clearYieldPulse]);

  if (!hasPosition || collateral <= 0) {
    return (
      <div className="page animate-fade-up">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">Your Stockline account</p>
          <h1 className="mt-1 text-2xl text-[var(--ink)]">No active credit</h1>
        </div>

        <Card className="space-y-3">
          <h2 className="text-lg text-[var(--ink)]">
            Turn your stocks into liquidity
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
            Deposit tokenized stocks to see how much you could access.
          </p>
          <Button size="lg" className="w-full" onClick={() => setView("deposit")}>
            Add stocks
          </Button>
        </Card>

        <ol className="space-y-4 px-1 pt-2">
          {[
            "Add stocks",
            "Access liquidity",
            "Let your assets help repay",
          ].map((label, i) => (
            <li key={label} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">
                {i + 1}
              </span>
              <span className="pt-1 text-sm font-medium text-[var(--ink)]">
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const repaid = Math.max(0, credit.originalDebt - debt);
  const progress =
    credit.originalDebt > 0 ? (repaid / credit.originalDebt) * 100 : 0;
  const needsAttention = health.status !== "Healthy";

  return (
    <div className="page animate-fade-up">
      <div>
        <p className="text-sm text-[var(--ink-muted)]">Your finances</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--ink)]">
          {formatUsd(collateral)}
        </p>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">Portfolio value</p>
      </div>

      {needsAttention ? (
        <Card className="space-y-3 border-[var(--warning)] bg-[var(--warning-soft)]">
          <h2 className="text-base text-[var(--ink)]">
            Your portfolio needs attention
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Your stocks have fallen in value. Your available credit has been
            reduced to keep your loan safe.
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => setView("deposit")}>
              Add stocks
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setView("loan")}
            >
              Repay
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <Metric label="Available" value={formatUsd(available)} />
        <Metric
          label="Borrowed"
          value={formatUsd(debt)}
          flash={flash}
        />
        <div className="surface-quiet flex flex-col gap-1 p-3">
          <span className="text-[11px] text-[var(--ink-subtle)]">Health</span>
          <StatusPill status={health.status} />
        </div>
      </div>

      <Card className="space-y-3">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">Available to borrow</p>
          <p className="mt-1 text-3xl font-semibold text-[var(--ink)]">
            {formatUsd(available)}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            You can access up to this amount based on your current portfolio.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={() => setView("borrow")}
          disabled={available < 1}
        >
          Borrow USDC
        </Button>
        <Expandable label="How is this calculated?">
          <Row k="Portfolio value" v={formatUsd(collateral)} />
          <Row k="Current loan" v={formatUsd(debt)} />
          <Row k="Safety buffer" v={formatPct(Math.max(0, credit.maxLtv - currentLtv))} />
        </Expandable>
      </Card>

      {debt > 0 ? (
        <Card className={`space-y-3 ${flash ? "animate-debt-flash" : ""}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--ink-muted)]">Your loan</p>
              <motion.p
                key={debt}
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                className="mt-1 text-2xl font-semibold text-[var(--ink)]"
              >
                {formatUsd(debt)}
              </motion.p>
              <p className="text-xs text-[var(--ink-subtle)]">remaining</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setView("loan")}>
              Manage
            </Button>
          </div>
          <ProgressBar value={progress} />
          <div className="rounded-xl bg-[var(--bg)] px-3 py-3 text-sm">
            <p className="font-semibold text-[var(--ink)]">
              Auto-repay {credit.autoRepayEnabled ? "ON" : "OFF"}
            </p>
            <p className="mt-1 text-[var(--ink-muted)]">
              {formatUsd(credit.yieldGeneratedMonth || yieldMonthly)} generated
              this month
            </p>
            <p className="text-[var(--ink-muted)]">
              {formatUsd(credit.yieldAppliedMonth || (credit.autoRepayEnabled ? repayHint(yieldMonthly, credit.autoRepayPercent) : 0))}{" "}
              applied to your loan
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-[var(--accent)]"
              onClick={() => setAutoOpen(true)}
            >
              Manage
            </button>
          </div>
        </Card>
      ) : null}

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => setView("portfolio")}
      >
        Manage portfolio
      </Button>

      <AutoRepaySheet open={autoOpen} onClose={() => setAutoOpen(false)} />
    </div>
  );
}

function repayHint(monthly: number, pct: number) {
  return Math.round(monthly * (pct / 100));
}

function Metric({
  label,
  value,
  flash,
}: {
  label: string;
  value: string;
  flash?: boolean;
}) {
  return (
    <div
      className={`surface-quiet flex flex-col gap-1 p-3 ${flash ? "animate-debt-flash" : ""}`}
    >
      <span className="text-[11px] text-[var(--ink-subtle)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--ink)]">{value}</span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{k}</span>
      <span className="font-medium text-[var(--ink)]">{v}</span>
    </div>
  );
}
