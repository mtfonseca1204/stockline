"use client";

import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

export function AlertStack() {
  const { alerts, dismissAlert } = useApp();
  if (alerts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100%-2rem,340px)] flex-col gap-2">
      {alerts.slice(0, 2).map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "pointer-events-auto animate-slide-up rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{alert.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">
                {alert.message}
              </p>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="rounded-md p-1 text-[var(--ink-subtle)] hover:bg-[var(--surface-muted)]"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
