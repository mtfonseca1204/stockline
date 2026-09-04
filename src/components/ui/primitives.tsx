"use client";

import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              {title ? (
                <h2 className="text-lg font-semibold text-[var(--ink)]">
                  {title}
                </h2>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-black/[0.04]"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export function Expandable({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={cn("group", className)}>
      <summary className="cursor-pointer list-none text-sm font-medium text-[var(--accent)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1">
          {label}
          <span className="text-[var(--ink-subtle)] transition group-open:rotate-180">
            ▾
          </span>
        </span>
      </summary>
      <div className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
        {children}
      </div>
    </details>
  );
}

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        "h-2 overflow-hidden rounded-full bg-[var(--border)]",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-[var(--accent)] transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function StatusPill({
  status,
}: {
  status: "Healthy" | "Caution" | "High risk" | string;
}) {
  const tone =
    status === "Healthy"
      ? "bg-[var(--success-soft)] text-[var(--success)]"
      : status === "Caution"
        ? "bg-[var(--warning-soft)] text-[var(--warning)]"
        : "bg-[var(--danger-soft)] text-[var(--danger)]";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        tone
      )}
    >
      {status === "High risk" ? "Needs attention" : status}
    </span>
  );
}
