"use client";
import { useState } from "react";
import { Wallet } from "lucide-react";
import { Sheet, ChoiceRow, Expandable } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { errorMessage } from "@/lib/chain/amounts";
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
            leading={<Wallet size={32} className="text-[var(--accent)]" />}
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
      {!connectors.length && <p>Install a browser wallet to connect.</p>}
      {error && <p role="alert">{error}</p>}
      <Button
        variant="ghost"
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
