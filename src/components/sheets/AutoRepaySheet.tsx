"use client";

import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/primitives";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/calculations";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const OPTIONS = [
  {
    value: 100,
    title: "100%",
    desc: "Pay down the loan faster",
  },
  {
    value: 75,
    title: "75%",
    desc: "Balance repayment and flexibility",
  },
  {
    value: 50,
    title: "50%",
    desc: "Keep some money available",
  },
] as const;

export function AutoRepaySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { credit, yieldMonthly, setAutoRepay } = useApp();
  const [pct, setPct] = useState(credit.autoRepayPercent || 100);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (open) setPct(credit.autoRepayPercent || 100);
  }, [open, credit.autoRepayPercent]);

  const monthly = yieldMonthly || 86;
  const applied = Math.round(monthly * (pct / 100));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="How should your assets repay your loan?"
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => setPct(opt.value)}
            data-selected={pct === opt.value}
            whileHover={reduce ? undefined : { y: -2, scale: 1.01 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            animate={{
              borderColor:
                pct === opt.value ? "var(--brand)" : "var(--border)",
              backgroundColor:
                pct === opt.value ? "var(--accent-soft)" : "var(--bg)",
              scale: pct === opt.value ? 1.01 : 1,
            }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="w-full rounded-xl border px-4 py-3 text-left"
          >
            <p className="font-semibold text-[var(--ink)]">{opt.title}</p>
            <p className="text-sm text-[var(--ink-muted)]">{opt.desc}</p>
          </motion.button>
        ))}
      </div>

      <motion.div
        key={applied}
        initial={reduce ? false : { opacity: 0.5, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 space-y-1 rounded-xl bg-[var(--bg)] px-4 py-3 text-sm text-[var(--ink-muted)]"
      >
        <p>{formatUsd(monthly)} monthly generated (est.)</p>
        <p className="font-semibold text-[var(--ink)]">
          {formatUsd(applied)} estimated monthly repayment
        </p>
      </motion.div>

      <p className="mt-3 text-xs text-[var(--ink-subtle)]">
        Amounts are estimates and may change.
      </p>

      <Button
        size="lg"
        className="mt-5 w-full"
        onClick={() => {
          setAutoRepay(true, pct);
          onClose();
        }}
      >
        Save
      </Button>
    </Sheet>
  );
}
