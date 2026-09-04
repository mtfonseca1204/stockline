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
    "bg-[var(--lime)] text-[var(--bg)] hover:bg-[var(--lime-hover)] font-semibold",
  secondary:
    "bg-white/[0.06] text-[var(--ink)] border border-[var(--border)] hover:bg-white/[0.1] backdrop-blur-md",
  ghost:
    "bg-transparent text-[var(--ink-muted)] hover:bg-white/[0.05] hover:text-[var(--ink)]",
  danger: "bg-[var(--danger)] text-white hover:opacity-90",
  soft: "bg-[var(--lime-soft)] text-[var(--lime)] hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
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
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
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
