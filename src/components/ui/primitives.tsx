"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { BottomSheet } from "./BottomSheet";

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
  return open ? <BottomSheet title={title ?? "Details"} onClose={onClose}>{children}</BottomSheet> : null;
}

export function Expandable({ label, children, className, iconOnly = false }: {
  label: string;
  children: ReactNode;
  className?: string;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <button type="button" aria-label={label} aria-haspopup="dialog" onClick={() => setOpen(true)} className={iconOnly ? "rounded-full p-2 text-[var(--ink-muted)] hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]" : "text-sm font-medium text-[var(--brand-ink)] underline decoration-[var(--brand)] decoration-2 underline-offset-4"}>
        {iconOnly ? <Info size={18} aria-hidden="true" /> : label}
      </button>
      {open && <BottomSheet title={label} onClose={() => setOpen(false)}><div className="space-y-2 text-sm text-[var(--ink-muted)]">{children}</div></BottomSheet>}
    </div>
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

export function InlineAlert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-[var(--radius-sm)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
    >
      {children}
    </p>
  );
}

export function EnvPill({ children }: { children: ReactNode }) {
  return (
    <span className="status-pill inline-flex rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent)]">
      {children}
    </span>
  );
}

export function ToggleRow({
  checked,
  disabled,
  onChange,
  title,
  subtitle,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left",
        checked
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--bg)]",
        disabled && "opacity-50"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
          checked
            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
            : "border-[var(--border-strong)] bg-white"
        )}
      >
        {checked ? "✓" : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--ink)]">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  );
}
