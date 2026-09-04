"use client";

import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

export function AlertStack() {
  const { alerts, dismissAlert } = useApp();
  if (alerts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 mx-auto flex max-w-md flex-col gap-2 px-4">
      {alerts.map((a) => (
        <div
          key={a.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg",
            a.tone === "warning" || a.tone === "critical"
              ? "border-[var(--warning)]"
              : "border-[var(--border)]"
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--ink)]">{a.title}</p>
            <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{a.message}</p>
          </div>
          <button
            type="button"
            className="text-[var(--ink-subtle)]"
            onClick={() => dismissAlert(a.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
