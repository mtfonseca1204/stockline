"use client";

import { cn } from "@/lib/cn";

/** Angular icons tuned to Kora’s geometric lime mark language */
type IconProps = {
  active?: boolean;
  className?: string;
  size?: number;
};

function tone(active?: boolean) {
  return active ? "var(--brand)" : "currentColor";
}

export function IconHome({ active, className, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <path
        d="M3 10.5L12 3l9 7.5V21H14.5v-6.5h-5V21H3V10.5Z"
        fill={tone(active)}
        fillOpacity={active ? 1 : 0.2}
        stroke={tone(active)}
        strokeWidth={1.8}
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function IconPortfolio({ active, className, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <path
        d="M3 7h18v3H3V7Z"
        fill={tone(active)}
        fillOpacity={active ? 1 : 0.25}
      />
      <path
        d="M4.5 10h15V20H4.5V10Z"
        stroke={tone(active)}
        strokeWidth={1.8}
        fill={active ? "var(--accent-soft)" : "none"}
      />
      <path
        d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"
        stroke={tone(active)}
        strokeWidth={1.8}
      />
      <path d="M3 14h18" stroke={tone(active)} strokeWidth={1.8} />
    </svg>
  );
}

export function IconBorrow({ active, className, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      {/* Angular K-inspired chevron / liquidity mark */}
      <path
        d="M4 4h7.5L6.5 12 11.5 20H4l5-8L4 4Z"
        fill={tone(active)}
        fillOpacity={active ? 1 : 0.22}
      />
      <path
        d="M12.5 4H20l-5 8 5 8h-7.5l5-8-5-8Z"
        fill={tone(active)}
        fillOpacity={active ? 0.55 : 0.12}
        stroke={tone(active)}
        strokeWidth={1.4}
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function IconActivity({ active, className, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <path
        d="M3 17h4l2.5-8 3 12L16 9l2 4h3"
        stroke={tone(active)}
        strokeWidth={2}
        strokeLinejoin="miter"
        strokeLinecap="square"
        fill="none"
      />
      {active ? (
        <path
          d="M3 17h4l2.5-8 3 12L16 9l2 4h3"
          stroke="var(--brand)"
          strokeWidth={2}
          strokeOpacity={0.35}
          strokeLinejoin="miter"
        />
      ) : null}
    </svg>
  );
}
