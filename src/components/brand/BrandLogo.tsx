"use client";

import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  /** Pixel width of the rendered logo */
  width?: number;
  /** Visual size presets */
  size?: "xs" | "sm" | "md" | "lg";
};

const WORDMARK: Record<NonNullable<LogoProps["size"]>, number> = {
  xs: 64,
  sm: 72,
  md: 88,
  lg: 104,
};

/** Full Kora wordmark (lime K + dark “ora”) — keep compact in chrome */
export function BrandLogo({ className, width, size = "sm" }: LogoProps) {
  const w = width ?? WORDMARK[size];
  const height = Math.round((w * 137) / 391);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/kora-logo.svg"
      alt="Kora"
      width={w}
      height={height}
      className={cn("h-auto max-h-6 w-auto select-none object-contain object-left", className)}
      draggable={false}
    />
  );
}

/** Lime K mark only — for favicon-style / compact spots */
export function BrandMark({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/kora-mark.svg"
      alt=""
      aria-hidden
      width={size}
      height={Math.round((size * 95) / 105)}
      className={cn("select-none object-contain", className)}
      draggable={false}
    />
  );
}
