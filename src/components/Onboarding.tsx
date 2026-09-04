"use client";

import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const KEY = "stockline-onboarded-v2";

export function useNeedsOnboarding() {
  const [ready, setReady] = useState(false);
  const [needs, setNeeds] = useState(false);

  useEffect(() => {
    try {
      setNeeds(localStorage.getItem(KEY) !== "1");
    } catch {
      setNeeds(true);
    }
    setReady(true);
  }, []);

  const clear = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setNeeds(false);
  };

  return { ready, needs, clear };
}

const steps = [
  {
    id: 0,
    headline: "Your stocks can do more than sit in your portfolio.",
    body: "Stockline lets you access liquidity without selling your tokenized stocks.",
    visual: "intro",
  },
  {
    id: 1,
    headline: "Keep your stocks",
    body: "You deposit eligible tokenized stocks into Stockline. They remain yours while backing your credit.",
    visual: "keep",
  },
  {
    id: 2,
    headline: "Access cash without selling",
    body: "Use your stocks to access USDC while keeping your market exposure.",
    visual: "access",
  },
  {
    id: 3,
    headline: "Your assets can help repay the loan",
    body: "When your productive assets generate money, Stockline can automatically direct it toward your outstanding balance.",
    visual: "repay",
  },
  {
    id: 4,
    headline: "You're always in control",
    body: "You choose how much to borrow, how much goes toward repayment, and when to repay.",
    visual: "control",
  },
] as const;

function Visual({ kind }: { kind: (typeof steps)[number]["visual"] }) {
  if (kind === "intro") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-sm font-medium text-[var(--ink-muted)]">
        <div className="rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-[var(--ink)]">
          Stocks
        </div>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          ↓
        </motion.div>
        <div className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-5 py-3 font-semibold text-[var(--accent)]">
          Liquidity
        </div>
      </div>
    );
  }
  if (kind === "keep") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-sm">
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--ink)]">
          Your portfolio
        </div>
        <span className="text-[var(--ink-subtle)]">↓</span>
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg)] px-4 py-3 text-[var(--ink-muted)]">
          Locked as backing · still yours
        </div>
      </div>
    );
  }
  if (kind === "access") {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <p className="text-2xl font-semibold text-[var(--ink)]">$10,000</p>
        <p className="text-sm text-[var(--ink-muted)]">in stocks</p>
        <span className="text-[var(--ink-subtle)]">↓</span>
        <p className="text-xl font-semibold text-[var(--accent)]">
          Up to $5,500 available
        </p>
      </div>
    );
  }
  if (kind === "repay") {
    return (
      <div className="flow-arrow py-4">
        <span className="rounded-lg bg-white px-3 py-1.5 border border-[var(--border)]">
          Generated
        </span>
        <span>↓</span>
        <span className="rounded-lg bg-white px-3 py-1.5 border border-[var(--border)]">
          Applied to loan
        </span>
        <span>↓</span>
        <span className="rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1.5 font-semibold text-[var(--accent)]">
          Lower debt
        </span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2 py-6 text-center text-xs font-semibold">
      {["Borrow", "Auto-repay", "Withdraw"].map((label) => (
        <div
          key={label}
          className="rounded-xl border border-[var(--border)] bg-white px-2 py-4 text-[var(--ink)]"
        >
          {label}
        </div>
      ))}
    </div>
  );
}

export function Onboarding({
  onDone,
  onConnect,
}: {
  onDone: () => void;
  onConnect: () => void;
}) {
  const { enableDemoMode } = useApp();
  const [step, setStep] = useState(0);
  const [showHow, setShowHow] = useState(false);
  const current = steps[step];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-5 py-8">
      <div>
        <p className="mb-8 text-sm font-semibold tracking-tight text-[var(--ink)]">
          Stockline
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.28 }}
            className="space-y-4"
          >
            <h1 className="display text-[1.75rem] text-[var(--ink)] sm:text-[2rem]">
              {current.headline}
            </h1>
            <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
              {current.body}
            </p>
            <div className="surface-quiet mt-2 px-4">{Visual({ kind: current.visual })}</div>
          </motion.div>
        </AnimatePresence>

        {step === 0 && showHow ? (
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)]">
            Deposit stocks → access USDC → optionally let money your assets
            generate reduce your loan. You stay invested the whole time.
          </p>
        ) : null}
      </div>

      <div className="space-y-3 pt-8">
        <div className="flex gap-1.5 pb-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full ${
                s.id <= step ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        {step === 0 ? (
          <>
            <Button
              size="lg"
              className="w-full"
              onClick={() => setStep(1)}
            >
              Get started
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowHow((v) => !v)}
            >
              How does it work?
            </Button>
          </>
        ) : step < 4 ? (
          <Button size="lg" className="w-full" onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                onDone();
                onConnect();
              }}
            >
              Connect wallet
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                onDone();
                enableDemoMode();
              }}
            >
              Try demo mode
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
