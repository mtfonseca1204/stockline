"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function LandingPage({
  onConnect,
  onDemo,
  onReplayOnboarding,
}: {
  onConnect: () => void;
  onDemo: () => void;
  onReplayOnboarding?: () => void;
}) {
  return (
    <div className="page animate-fade-up !pb-10">
      <div className="pt-10">
        <h1 className="display text-[2.15rem] text-[var(--ink)] sm:text-[2.4rem]">
          Keep your stocks.
          <br />
          Access liquidity.
        </h1>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--ink-muted)]">
          Your assets stay invested while helping repay your loan.
        </p>
      </div>

      <motion.div
        className="surface mt-4 flex flex-col items-center gap-2 px-6 py-8 text-sm text-[var(--ink-muted)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <span className="font-medium text-[var(--ink)]">Stocks</span>
        <span>↓</span>
        <span className="rounded-md bg-[var(--brand)] px-2 py-0.5 font-semibold text-[var(--brand-ink)]">
          Cash without selling
        </span>
        <span>↓</span>
        <span className="font-medium text-[var(--ink)]">Assets help repay</span>
      </motion.div>

      <div className="mt-auto space-y-3 pt-8">
        <Button size="lg" className="w-full" onClick={onConnect}>
          Get started
        </Button>
        <Button size="lg" variant="secondary" className="w-full" onClick={onDemo}>
          Enter demo mode
        </Button>
        {onReplayOnboarding ? (
          <Button variant="ghost" className="w-full" onClick={onReplayOnboarding}>
            Replay onboarding
          </Button>
        ) : null}
      </div>
    </div>
  );
}
