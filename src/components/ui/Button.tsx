"use client";

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] font-semibold shadow-sm",
  secondary:
    "bg-[var(--bg-elevated)] text-[var(--ink)] border border-[var(--border-strong)] hover:bg-[var(--bg)]",
  ghost:
    "bg-transparent text-[var(--ink-muted)] hover:bg-black/[0.04] hover:text-[var(--ink)]",
  danger: "bg-[var(--danger)] text-white hover:opacity-90",
  soft: "bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-90 font-semibold",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-[10px]",
  md: "h-11 px-4 text-sm rounded-[12px]",
  lg: "h-12 px-5 text-[15px] rounded-[12px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
