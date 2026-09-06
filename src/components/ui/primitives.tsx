"use client";

import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const reduce = useReducedMotion();

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
            initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
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
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={reduce ? undefined : { scale: 1.08, rotate: 90 }}
                whileTap={reduce ? undefined : { scale: 0.9 }}
                className="pressable rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-black/[0.04] hover:text-[var(--ink)]"
              >
                <X size={18} />
              </motion.button>
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
      <summary className="expand-summary cursor-pointer list-none text-sm font-medium text-[var(--brand-ink)] underline decoration-[var(--brand)] decoration-2 underline-offset-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1">
          {label}
          <span className="inline-block text-[var(--ink-subtle)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-open:rotate-180">
            ▾
          </span>
        </span>
      </summary>
      <div className="mt-3 animate-fade-up space-y-2 text-sm text-[var(--ink-muted)]">
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
      <motion.div
        className="h-full rounded-full bg-[var(--accent)]"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
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
      ? "bg-[var(--accent-soft)] text-[var(--brand-ink)]"
      : status === "Caution"
        ? "bg-[var(--warning-soft)] text-[var(--warning)]"
        : "bg-[var(--danger-soft)] text-[var(--danger)]";
  return (
    <span
      className={cn(
        "status-pill inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        tone
      )}
    >
      {status === "High risk" ? "Needs attention" : status}
    </span>
  );
}

/** Selectable option used in sheets / wallet lists */
export function ChoiceRow({
  selected,
  onClick,
  title,
  subtitle,
  right,
  leading,
}: {
  selected?: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  leading?: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduce ? undefined : { y: -1, scale: 1.01 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      animate={
        selected
          ? { borderColor: "var(--brand)", backgroundColor: "var(--accent-soft)" }
          : { borderColor: "var(--border)", backgroundColor: "var(--bg)" }
      }
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left"
      )}
    >
      {leading ? <span className="shrink-0">{leading}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[var(--ink)]">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block text-sm text-[var(--ink-muted)]">
            {subtitle}
          </span>
        ) : null}
      </span>
      {right ? (
        <span className="shrink-0 text-xs text-[var(--ink-subtle)]">{right}</span>
      ) : null}
    </motion.button>
  );
}
