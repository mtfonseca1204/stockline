"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  details,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading,
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  details?: Array<{ label: string; value: string }>;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in"
        onClick={() => !loading && onClose()}
      />
      <div className="glass-strong relative z-10 w-full animate-slide-up rounded-t-3xl sm:rounded-3xl sm:max-w-md p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            onClick={() => !loading && onClose()}
            className="rounded-lg p-2 text-[var(--ink-muted)] hover:bg-white/5"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {details && details.length > 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white/[0.03] px-4">
            {details.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between border-b border-[var(--border)] py-3 last:border-0"
              >
                <span className="text-sm text-[var(--ink-muted)]">{d.label}</span>
                <span className="text-sm font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            className={cn("flex-1", danger && "bg-[var(--danger)] text-white hover:opacity-90")}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Glass({
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
