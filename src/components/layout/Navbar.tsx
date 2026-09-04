"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Tooltip";
import { useApp } from "@/context/AppContext";
import { shortAddress } from "@/lib/calculations";
import { cn } from "@/lib/cn";
import type { AppView } from "@/lib/types";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV: Array<{ id: AppView; label: string }> = [
  { id: "dashboard", label: "Home" },
  { id: "portfolio", label: "Portfolio" },
  { id: "credit", label: "Credit" },
  { id: "activity", label: "Activity" },
];

export function Navbar({ onConnect }: { onConnect: () => void }) {
  const {
    connected,
    walletAddress,
    view,
    setView,
    demoMode,
    hasPosition,
    disconnectWallet,
  } = useApp();
  const [open, setOpen] = useState(false);

  const go = (id: AppView) => {
    if (!connected) {
      onConnect();
      return;
    }
    if (!hasPosition && id !== "dashboard" && id !== "activity") {
      setView("empty");
      return;
    }
    setView(id === "credit" && !hasPosition ? "empty" : id);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <button
          onClick={() =>
            setView(connected ? (hasPosition ? "dashboard" : "empty") : "landing")
          }
          className="flex items-center gap-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--lime)] text-xs font-extrabold text-[var(--bg)]">
            S
          </span>
          <span className="font-semibold tracking-tight">Stockline</span>
        </button>

        {connected ? (
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                  view === item.id ||
                    (item.id === "credit" &&
                      ["borrow", "deposit", "withdraw", "auto-repay", "risk"].includes(
                        view
                      ))
                    ? "text-[var(--lime)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          <Badge tone="lime">Base</Badge>
          {demoMode ? <Badge tone="amber">Demo</Badge> : null}
          {connected && walletAddress ? (
            <Button variant="secondary" size="sm" onClick={disconnectWallet}>
              {shortAddress(walletAddress)}
            </Button>
          ) : (
            <Button size="sm" onClick={onConnect}>
              Connect
            </Button>
          )}
          {connected ? (
            <button
              className="rounded-lg p-2 text-[var(--ink-muted)] sm:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
      </div>

      {open && connected ? (
        <div className="border-t border-[var(--border)] px-4 py-2 sm:hidden">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={cn(
                "block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium",
                view === item.id
                  ? "text-[var(--lime)]"
                  : "text-[var(--ink-muted)]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </header>
  );
}
