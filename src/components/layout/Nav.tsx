"use client";

import { useApp } from "@/context/AppContext";
import { shortAddress } from "@/lib/calculations";
import type { AppView } from "@/lib/types";
import { Activity, Home, Landmark, PieChart } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS: { id: AppView; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "portfolio", label: "Portfolio", icon: PieChart },
  { id: "borrow", label: "Borrow", icon: Landmark },
  { id: "activity", label: "Activity", icon: Activity },
];

export function TopBar({ onConnect }: { onConnect: () => void }) {
  const { connected, walletAddress, disconnectWallet, demoMode } = useApp();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
        <p className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
          Stockline
        </p>
        {connected && walletAddress ? (
          <button
            type="button"
            onClick={disconnectWallet}
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)]"
          >
            {demoMode ? "Demo" : shortAddress(walletAddress)}
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Connect
          </button>
        )}
      </div>
    </header>
  );
}

export function BottomNav() {
  const { view, setView, connected } = useApp();
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
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={cn(
                "flex min-w-[4.5rem] flex-col items-center gap-0.5 px-3 py-2.5 text-[11px] font-medium transition",
                isActive ? "text-[var(--accent)]" : "text-[var(--ink-subtle)]"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
