"use client";

import { Button } from "@/components/ui/Button";
import { Expandable, Sheet } from "@/components/ui/primitives";
import { useApp } from "@/context/AppContext";
import type { WalletProvider } from "@/lib/types";

const OPTIONS: { id: WalletProvider; label: string; hint: string }[] = [
  { id: "coinbase", label: "Coinbase Wallet", hint: "Recommended on Base" },
  { id: "metamask", label: "MetaMask", hint: "Browser extension" },
  { id: "walletconnect", label: "WalletConnect", hint: "Scan to connect" },
];

export function WalletModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { connectWallet, enableDemoMode } = useApp();

  const pick = (id: WalletProvider) => {
    connectWallet(id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Connect your wallet">
      <p className="mb-5 text-sm text-[var(--ink-muted)]">
        Connect a wallet on Base to get started.
      </p>
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => pick(opt.id)}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5 text-left transition hover:border-[var(--border-strong)]"
          >
            <span className="font-semibold text-[var(--ink)]">{opt.label}</span>
            <span className="text-xs text-[var(--ink-subtle)]">{opt.hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <Expandable label="Why do I need a wallet?">
          <p>
            Your wallet is how Stockline interacts with your onchain assets.
            Stockline never needs your private keys.
          </p>
        </Expandable>
      </div>

      <Button
        variant="ghost"
        className="mt-4 w-full"
        onClick={() => {
          enableDemoMode();
          onClose();
        }}
      >
        Continue with demo mode
      </Button>
    </Sheet>
  );
}
