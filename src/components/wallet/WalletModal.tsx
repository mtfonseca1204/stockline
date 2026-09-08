"use client";
import { useState } from "react";
import { Wallet } from "lucide-react";
import {
  Sheet,
  ChoiceRow,
  Expandable,
  InlineAlert,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { errorMessage } from "@/lib/chain/amounts";

function WalletMark({ icon }: { icon?: string }) {
  const [failed, setFailed] = useState(false);
  if (!icon || failed) {
    return <Wallet size={32} aria-hidden className="shrink-0 text-[var(--ink-muted)]" />;
  }
  return (
    // Wallet extensions supply their own EIP-6963 icons, including SVG data URIs.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt=""
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded-lg object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export function WalletModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { connectors, connectWallet, startApp } = useApp();
  const [error, setError] = useState("");
  return (
    <Sheet open={open} onClose={onClose} title="Connect your wallet">
      <p className="mb-5 text-sm text-[var(--ink-muted)]">
        Your wallet signs transactions. Kora never asks for your private key.
      </p>
      <div className="space-y-2">
        {connectors.map((c) => (
          <ChoiceRow
            key={c.uid}
            title={c.name}
            leading={<WalletMark key={c.icon ?? c.uid} icon={c.icon} />}
            onClick={async () => {
              try {
                await connectWallet(c);
                onClose();
              } catch (e) {
                setError(errorMessage(e));
              }
            }}
          />
        ))}
      </div>
      <div className="my-5">
        <Expandable label="Why do I need a wallet?">
          <p>Your wallet holds your assets and approves each transaction.</p>
        </Expandable>
      </div>
      {!connectors.length && (
        <p className="text-sm text-[var(--ink-muted)]">
          Install a browser wallet to connect.
        </p>
      )}
      {error && <InlineAlert>{error}</InlineAlert>}
      <Button
        variant="ghost"
        className="mt-3 w-full"
        onClick={() => {
          startApp();
          onClose();
        }}
      >
        Browse without a wallet
      </Button>
    </Sheet>
  );
}
