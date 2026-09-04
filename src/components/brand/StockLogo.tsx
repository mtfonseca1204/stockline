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
      <svg viewBox="0 0 24 24" className="absolute inset-[16%] h-[68%] w-[68%]">
        <path
          fill="#fff"
          d="M12.1 6.2c-3.8 0-6.9 1.3-7.8 3.1-.1.2 1.1-.3 2.3-.5 2.3-.4 4.5-.2 4.5-.2s-3.6.4-5.2 1.5C4.2 11.3 3.5 13 4 14.8c.7 2.6 3.6 4.4 8 4.4 5.5 0 9.6-3.1 9.6-7.2 0-3.3-3.6-5.8-9.5-5.8Zm.2 9.9c-3.4 0-5.8-1.5-5.8-3.5 0-2 2.4-3.5 5.8-3.5s5.8 1.5 5.8 3.5-2.4 3.5-5.8 3.5Z"
        />
        <path
          fill="#fff"
          fillOpacity="0.85"
          d="M8.6 5.1c.6-.5 1.6-.9 2.8-1.1C9.6 2.6 7.7 2 6.2 2 4.2 2 3 3.1 3 4.5c0 1.2 1 1.9 2.6 2.1-.1-.6.4-1.1 1.2-1.5.5-.2 1.2-.2 1.8 0Z"
        />
      </svg>
    </Frame>
  );
}

function MetaLogo({ size, className }: { size: number; className?: string }) {
  return (
    <Frame size={size} className={className} bg="#0668E1">
      <svg
        viewBox="0 0 36 24"
        className="absolute inset-x-[14%] inset-y-[28%] h-[44%] w-[72%]"
      >
        <path
          fill="#fff"
          d="M4.2 18.5C2 15.8 1 13 1 10.4 1 6.2 3.8 3 8 3c2.2 0 3.9 1 5.5 3.1L18 12.2 22.5 6.1C24.1 4 25.8 3 28 3c4.2 0 7 3.2 7 7.4 0 2.6-1 5.4-3.2 8.1L29.4 21l-2.2-2.6C28.8 16.2 29.5 14 29.5 12c0-2.5-1.4-4.1-3.5-4.1-1.3 0-2.4.7-3.6 2.5L18 17.2l-4.4-6.8C12.4 8.6 11.3 7.9 10 7.9c-2.1 0-3.5 1.6-3.5 4.1 0 2 .7 4.2 2.3 6.4L6.6 21 4.2 18.5Z"
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
