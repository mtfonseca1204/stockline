"use client";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const KEY = "kora-onboarded-v3";

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

  const reset = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setNeeds(true);
  };

  return { ready, needs, clear, reset };
}

const steps = [
  {
    id: 0,
    headline: "Your stocks can do more than sit in your portfolio.",
    body: "Kora lets you access liquidity without selling your tokenized stocks.",
    image: "/onboarding/intro-blue.png",
    alt: "Person unlocking liquidity from their stocks",
  },
  {
    id: 1,
    headline: "Keep your stocks",
    body: "You deposit eligible tokenized stocks into Kora. They remain yours while backing your credit.",
    image: "/onboarding/keep-blue.png",
    alt: "Person securing stocks that still belong to them",
  },
  {
    id: 2,
    headline: "Access cash without selling",
    body: "Use your stocks to access USDC while keeping your market exposure.",
    image: "/onboarding/access-blue.png",
    alt: "Person accessing cash while stocks stay invested",
    example: true,
  },
  {
    id: 3,
    headline: "Your assets can help repay the loan",
    body: "When your productive assets generate money, Kora can automatically direct it toward your outstanding balance.",
    image: "/onboarding/repay-blue.png",
    alt: "People watching their loan shrink as assets generate value",
  },
  {
    id: 4,
    headline: "You're always in control",
    body: "You choose how much to borrow, how much goes toward repayment, and when to repay.",
    image: "/onboarding/control-blue.png",
    alt: "Person adjusting borrow, auto-repay, and withdraw controls",
  },
] as const;

export function Onboarding({
  onDone,
  onConnect,
}: {
  onDone: () => void;
  onConnect: () => void;
}) {
  const { startApp } = useApp();
  const [step, setStep] = useState(0);
  const [showHow, setShowHow] = useState(false);
  const current = steps[step];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-5 py-8">
      <div>
        <div className="mb-6">
          <BrandLogo size="sm" className="max-h-6" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.28 }}
            className="space-y-4"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)]">
              <Image
                src={current.image}
                alt={current.alt}
                fill
                sizes="(max-width: 448px) 100vw, 448px"
                className="object-cover"
                priority={step === 0}
              />
            </div>

            <h1 className="display text-[1.75rem] text-[var(--ink)] sm:text-[2rem]">
              {current.headline}
            </h1>
            <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
              {current.body}
            </p>

            {"example" in current && current.example ? (
              <div className="surface-quiet flex flex-col items-center gap-1 px-4 py-4 text-center">
                <p className="text-2xl font-semibold text-[var(--ink)]">
                  $10,000
                </p>
                <p className="text-sm text-[var(--ink-muted)]">in stocks</p>
                <span className="text-[var(--ink-subtle)]">↓</span>
                <p className="text-lg font-semibold text-[var(--ink)]">
                  Up to{" "}
                  <span className="font-semibold text-[var(--accent)]">
                    $5,500
                  </span>{" "}
                  available
                </p>
              </div>
            ) : null}
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
              className={`h-1 flex-1 rounded-full transition-colors ${
                s.id <= step ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        {step === 0 ? (
          <>
            <Button size="lg" className="w-full" onClick={() => setStep(1)}>
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
                startApp();
              }}
            >
              Try the app
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
