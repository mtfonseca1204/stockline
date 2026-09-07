"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Image from "next/image";

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
          Borrow against your tokens. Repay with USDC or sell part of your collateral.
        </p>
      </div>

      <motion.div
        className="surface mt-4 overflow-hidden p-2 sm:p-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[calc(var(--radius)-4px)] bg-white">
          <Image
            src="/landing/product-loop.png"
            alt="Borrow USDC against stocks, then repay with USDC or a partial sale"
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-contain object-center"
            priority
            unoptimized
          />
        </div>
      </motion.div>

      <div className="mt-auto space-y-3 pt-8">
        <Button size="lg" className="w-full" onClick={onConnect}>
          Get started
        </Button>
        <Button size="lg" variant="secondary" className="w-full" onClick={onDemo}>
          Open app
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
