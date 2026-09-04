"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import type { WalletProvider } from "@/lib/types";
import { useState } from "react";

const WALLETS: Array<{ id: WalletProvider; name: string }> = [
  { id: "coinbase", name: "Coinbase Wallet" },
  { id: "metamask", name: "MetaMask" },
  { id: "walletconnect", name: "WalletConnect" },
];

export function WalletModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { connectWallet, enableDemoMode } = useApp();
  const [loading, setLoading] = useState<WalletProvider | null>(null);

  const connect = async (provider: WalletProvider) => {
    setLoading(provider);
    await new Promise((r) => setTimeout(r, 700));
    connectWallet(provider);
    setLoading(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Connect wallet"
      description="Base-compatible wallet required."
      size="sm"
    >
      <div className="space-y-2">
        {WALLETS.map((w) => (
          <button
            key={w.id}
            onClick={() => connect(w.id)}
            disabled={!!loading}
            className="flex w-full items-center rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-left text-sm font-medium hover:border-[var(--lime)] disabled:opacity-60"
          >
            {loading === w.id ? "Connecting…" : w.name}
          </button>
        ))}
        <Button
          variant="soft"
          className="mt-2 w-full"
          onClick={() => {
            enableDemoMode();
            onClose();
          }}
        >
          Enter Demo Mode
        </Button>
      </div>
    </Modal>
  );
}
