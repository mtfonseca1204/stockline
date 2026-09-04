"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "lime" | "green" | "amber" | "red";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-[var(--surface-muted)] text-[var(--ink-muted)]",
        tone === "lime" && "bg-[var(--lime-soft)] text-[var(--lime)]",
        tone === "green" && "bg-[var(--success-soft)] text-[var(--success)]",
        tone === "amber" && "bg-[var(--warning-soft)] text-[var(--warning)]",
        tone === "red" && "bg-[var(--danger-soft)] text-[var(--danger)]"
      )}
    >
      {children}
    </span>
  );
}

export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: ReactNode;
}) {
  return (
    <span className="group relative inline-flex items-center" title={content}>
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
}: {
  value: number;
  max?: number;
  tone?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
      <div
        className="h-full rounded-full bg-[var(--lime)] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
