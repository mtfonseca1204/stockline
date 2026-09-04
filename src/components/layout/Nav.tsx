"use client";

import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  IconActivity,
  IconBorrow,
  IconHome,
  IconPortfolio,
} from "@/components/brand/KoraIcons";
import { useApp } from "@/context/AppContext";
import { shortAddress } from "@/lib/calculations";
import type { AppView } from "@/lib/types";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentType } from "react";

const TABS: {
  id: AppView;
  label: string;
  Icon: ComponentType<{ active?: boolean; size?: number }>;
}[] = [
  { id: "home", label: "Home", Icon: IconHome },
  { id: "portfolio", label: "Portfolio", Icon: IconPortfolio },
  { id: "borrow", label: "Borrow", Icon: IconBorrow },
  { id: "activity", label: "Activity", Icon: IconActivity },
];

export function TopBar({ onConnect }: { onConnect: () => void }) {
  const { connected, walletAddress, disconnectWallet, demoMode } = useApp();
  const reduce = useReducedMotion();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-md items-center justify-between px-5">
        <BrandLogo size="xs" className="max-h-5" />
        {connected && walletAddress ? (
          <motion.button
            type="button"
            onClick={disconnectWallet}
            whileHover={reduce ? undefined : { y: -1, scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className="pressable rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]"
          >
            {demoMode ? "Demo" : shortAddress(walletAddress)}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={onConnect}
            whileHover={reduce ? undefined : { y: -1, scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            className="btn-cta btn-primary-glow rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Connect
          </motion.button>
        )}
      </div>
    </header>
  );
}

export function BottomNav() {
  const { view, setView, connected } = useApp();
  const reduce = useReducedMotion();
  if (!connected) return null;

  const active =
    view === "loan" || view === "deposit" || view === "withdraw" || view === "stock"
      ? view === "stock" || view === "deposit" || view === "withdraw"
        ? "portfolio"
        : view === "loan"
          ? "borrow"
          : "home"
      : view;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-white/95 backdrop-blur-md md:bottom-4 md:left-1/2 md:right-auto md:w-full md:max-w-md md:-translate-x-1/2 md:rounded-2xl md:border md:shadow-lg">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        {TABS.map((tab) => {
          const { Icon } = tab;
          const isActive = active === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              data-active={isActive}
              whileHover={reduce || isActive ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              className={cn(
                "nav-tab flex min-w-[4.5rem] flex-col items-center gap-0.5 px-3 py-2.5 text-[11px] font-medium",
                isActive ? "text-[var(--brand-ink)]" : "text-[var(--ink-subtle)]"
              )}
            >
              <span className="nav-tab-icon inline-flex">
                <Icon active={isActive} size={22} />
              </span>
              {tab.label}
              {isActive ? (
                <motion.span
                  layoutId="nav-dot"
                  className="mt-0.5 h-1 w-1 rounded-full bg-[var(--brand)]"
                  transition={{ type: "spring", stiffness: 480, damping: 32 }}
                />
              ) : (
                <span className="mt-0.5 h-1 w-1" />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
