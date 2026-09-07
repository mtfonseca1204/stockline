"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Props = {
  ticker: string;
  size?: number;
  className?: string;
};

export function StockLogo({ ticker, size = 40, className }: Props) {
  const t = ticker.toUpperCase();
  if (t === "AAPL") return <AppleLogo size={size} className={className} />;
  if (t === "NVDA") return <NvidiaLogo size={size} className={className} />;
  if (t === "META") return <MetaLogo size={size} className={className} />;
  if (t === "MSFT") return <MicrosoftLogo size={size} className={className} />;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-xs font-bold text-[var(--ink)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      {t.slice(0, 2)}
    </div>
  );
}

function Frame({
  size,
  className,
  bg,
  children,
  radius = "9999px",
}: {
  size: number;
  className?: string;
  bg: string;
  children: ReactNode;
  radius?: string;
}) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", className)}
      style={{
        width: size,
        height: size,
        background: bg,
        borderRadius: radius,
      }}
      aria-hidden
    >
      {children}
    </div>
  );
}

function AppleLogo({ size, className }: { size: number; className?: string }) {
  return (
    <Frame size={size} className={className} bg="#1E1E1E">
      <svg viewBox="0 0 24 24" className="absolute inset-[18%] h-[64%] w-[64%]">
        <path
          fill="#fff"
          d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.2-2.4-.1 0-2.2-.8-2.2-3.7Zm-2-5.9c.6-.7 1-1.7.9-2.7-0.9.1-1.9.6-2.5 1.3-.6.6-1.1 1.7-1 2.6 1 .1 1.9-.5 2.6-1.2Z"
        />
      </svg>
    </Frame>
  );
}

function NvidiaLogo({ size, className }: { size: number; className?: string }) {
  return (
    <Frame size={size} className={className} bg="#76B900">
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-[14%] h-[72%] w-[72%]"
        aria-hidden
      >
        <path
          fill="#fff"
          d="M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.398 0-.787-.062-1.158-.185v-4.346c1.528.185 1.837.857 2.747 2.385l2.04-1.714s-1.492-1.952-4-1.952a6.016 6.016 0 0 0-.796.035m0-4.735v2.138l.424-.027c5.45-.185 9.01 4.47 9.01 4.47s-4.08 4.964-8.33 4.964c-.37 0-.733-.035-1.095-.097v1.325c.3.035.61.062.91.062 3.957 0 6.82-2.023 9.593-4.408.459.371 2.34 1.263 2.73 1.652-2.633 2.208-8.772 3.984-12.253 3.984-.335 0-.653-.018-.971-.053v1.864H24V4.063zm0 10.326v1.131c-3.657-.654-4.673-4.46-4.673-4.46s1.758-1.944 4.673-2.262v1.237H8.94c-1.528-.186-2.73 1.245-2.73 1.245s.68 2.412 2.739 3.11M2.456 10.9s2.164-3.197 6.5-3.533V6.201C4.153 6.59 0 10.653 0 10.653s2.35 6.802 8.948 7.42v-1.237c-4.84-.6-6.492-5.936-6.492-5.936z"
        />
      </svg>
    </Frame>
  );
}

function MetaLogo({ size, className }: { size: number; className?: string }) {
  return (
    <Frame size={size} className={className} bg="#0866FF">
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-x-[12%] inset-y-[22%] h-[56%] w-[76%]"
        aria-hidden
      >
        <path
          fill="#fff"
          d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
        />
      </svg>
    </Frame>
  );
}

function MicrosoftLogo({ size, className }: { size: number; className?: string }) {
  return (
    <Frame size={size} className={className} bg="#F3F3F3" radius="10px">
      <div
        className="absolute inset-[18%] grid gap-[6%]"
        style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}
      >
        <span className="rounded-[2px]" style={{ background: "#F25022" }} />
        <span className="rounded-[2px]" style={{ background: "#7FBA00" }} />
        <span className="rounded-[2px]" style={{ background: "#00A4EF" }} />
        <span className="rounded-[2px]" style={{ background: "#FFB900" }} />
      </div>
    </Frame>
  );
}
