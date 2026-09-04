"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  strong,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div className={cn(strong ? "glass-strong" : "glass", className)}>
      {children}
    </div>
  );
}

export function StatRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--ink-muted)]">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold",
          accent ? "text-[var(--lime)]" : "text-[var(--ink)]"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function Divider() {
  return <div className="h-px w-full bg-[var(--border)]" />;
}
