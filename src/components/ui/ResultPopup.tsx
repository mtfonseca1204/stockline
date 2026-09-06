"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";

export type ResultStatus = "success" | "fail";

export function ResultPopup({
  open,
  status,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}: {
  open: boolean;
  status: ResultStatus;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose?: () => void;
}) {
  const reduce = useReducedMotion();
  const ok = status === "success";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose ?? onPrimary}
          />

          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="result-title"
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.86, y: 28 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.94, y: 12 }
            }
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-28",
                ok
                  ? "bg-gradient-to-b from-[var(--accent-soft)] to-transparent"
                  : "bg-gradient-to-b from-[var(--danger-soft)] to-transparent"
              )}
            />

            <div className="relative flex flex-col items-center text-center">
              <motion.div
                className={cn(
                  "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                  ok
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                )}
                initial={reduce ? false : { scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 460,
                  damping: 18,
                  delay: 0.08,
                }}
              >
                {ok ? (
                  <Check size={32} strokeWidth={2.6} />
                ) : (
                  <motion.span
                    initial={reduce ? false : { rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  >
                    <X size={28} strokeWidth={2.6} />
                  </motion.span>
                )}
              </motion.div>

              {!reduce ? (
                <motion.div
                  className={cn(
                    "pointer-events-none absolute top-6 h-16 w-16 rounded-full",
                    ok ? "bg-[var(--accent)]" : "bg-[var(--danger)]"
                  )}
                  initial={{ scale: 0.6, opacity: 0.28 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
                />
              ) : null}

              <motion.p
                id="result-title"
                className="text-xl font-semibold text-[var(--ink)]"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
              >
                {title}
              </motion.p>
              <motion.p
                className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
              >
                {message}
              </motion.p>

              <motion.div
                className="mt-6 flex w-full flex-col gap-2"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <Button size="lg" className="w-full" onClick={onPrimary}>
                  {primaryLabel}
                </Button>
                {secondaryLabel && onSecondary ? (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={onSecondary}
                  >
                    {secondaryLabel}
                  </Button>
                ) : null}
              </motion.div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
