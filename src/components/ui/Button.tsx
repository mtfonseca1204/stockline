"use client";

import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";
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
    "btn-primary-glow bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] font-semibold shadow-sm",
  secondary:
    "btn-secondary-lift bg-[var(--bg-elevated)] text-[var(--ink)] border border-[var(--border-strong)] hover:bg-[var(--bg)]",
  ghost:
    "bg-transparent text-[var(--ink-muted)] hover:bg-black/[0.05] hover:text-[var(--ink)] shadow-none",
  danger:
    "bg-[var(--danger)] text-white hover:brightness-110 font-semibold shadow-sm",
  soft: "bg-[var(--accent-soft)] text-[var(--accent)] hover:brightness-95 font-semibold border border-[rgba(0,82,255,0.22)]",
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
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const reduce = useReducedMotion();
  const {
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...rest
  } = props;

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={
        disabled || reduce
          ? undefined
          : variant === "ghost"
            ? { scale: 1.02 }
            : { y: -2, scale: 1.02 }
      }
      whileTap={
        reduce
          ? undefined
          : disabled
            ? { x: [0, -3, 3, -2, 2, 0], transition: { duration: 0.35 } }
            : { scale: 0.96, y: 1 }
      }
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      className={cn(
        "btn-cta inline-flex items-center justify-center gap-2 font-medium",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      <span className="relative z-[1] inline-flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
