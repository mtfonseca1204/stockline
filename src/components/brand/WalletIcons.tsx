"use client";

import { cn } from "@/lib/cn";
import type { WalletProvider } from "@/lib/types";

type SizeProps = { size?: number; className?: string };

export function WalletIcon({
  id,
  size = 28,
  className,
}: {
  id: WalletProvider;
  size?: number;
  className?: string;
}) {
  if (id === "coinbase") return <CoinbaseIcon size={size} className={className} />;
  if (id === "metamask") return <MetaMaskIcon size={size} className={className} />;
  return <WalletConnectIcon size={size} className={className} />;
}

/** Coinbase — blue disc + white C mark */
export function CoinbaseIcon({ size = 28, className }: SizeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("shrink-0 rounded-full", className)}
      aria-hidden
    >
      <circle cx="16" cy="16" r="16" fill="#0052FF" />
      <circle cx="16" cy="16" r="7.2" fill="none" stroke="#fff" strokeWidth="3.2" />
      <rect x="14.2" y="12.2" width="3.6" height="7.6" rx="0.6" fill="#fff" />
    </svg>
  );
}

/** MetaMask — simplified fox mark on orange */
export function MetaMaskIcon({ size = 28, className }: SizeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("shrink-0 rounded-[8px]", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#E2761B" />
      <path
        d="M8.2 11.2 16 7.4l7.8 3.8-1.4 8.6L16 24.6l-6.4-4.8-1.4-8.6Z"
        fill="#E4761B"
        stroke="#C0AD9E"
        strokeWidth="0.6"
      />
      <path d="M8.2 11.2 16 14.6l7.8-3.4" fill="#F6851B" />
      <path d="M16 14.6v10" stroke="#763D16" strokeWidth="1.2" />
      <path
        d="M11.2 18.4c1.2 1 3 1.6 4.8 1.6s3.6-.6 4.8-1.6"
        fill="none"
        stroke="#E4751F"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="12.2" cy="15.2" r="1.1" fill="#FFF" />
      <circle cx="19.8" cy="15.2" r="1.1" fill="#FFF" />
    </svg>
  );
}

/** WalletConnect — indigo disc + WC arcs */
export function WalletConnectIcon({ size = 28, className }: SizeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("shrink-0 rounded-full", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="10" fill="#3B99FC" />
      <path
        d="M10.2 14.2c3.2-3.1 8.4-3.1 11.6 0l.4.4a.6.6 0 0 1 0 .9l-1.3 1.3a.6.6 0 0 1-.9 0l-.5-.5c-2.1-2-5.5-2-7.6 0l-.6.5a.6.6 0 0 1-.9 0l-1.3-1.3a.6.6 0 0 1 0-.9l.1-.1Zm14.3 2.7 1.2 1.1a.6.6 0 0 1 0 .9l-5.3 5.2a1.8 1.8 0 0 1-2.5 0l-3.7-3.6a.3.3 0 0 0-.4 0l-3.7 3.6a1.8 1.8 0 0 1-2.5 0L2.3 19a.6.6 0 0 1 0-.9l1.2-1.1a.6.6 0 0 1 .9 0l5.3 5.2c.1.1.3.1.4 0l3.7-3.6a1.8 1.8 0 0 1 2.5 0l3.7 3.6c.1.1.3.1.4 0l5.3-5.2a.6.6 0 0 1 .8 0Z"
        fill="#fff"
      />
    </svg>
  );
}
