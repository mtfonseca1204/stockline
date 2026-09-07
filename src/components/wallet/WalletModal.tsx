"use client";
import { useState } from "react";
import {
  CoinbaseIcon,
  MetaMaskIcon,
  WalletConnectIcon,
} from "@/components/brand/WalletIcons";
import {
  Sheet,
  ChoiceRow,
  Expandable,
  InlineAlert,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { errorMessage } from "@/lib/chain/amounts";

function walletMark(name: string) {
  const n = name.toLowerCase();
  if (n.includes("coinbase") || n.includes("base"))
    return <CoinbaseIcon size={32} />;
  if (n.includes("meta")) return <MetaMaskIcon size={32} />;
  return <WalletConnectIcon size={32} />;
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
            leading={walletMark(c.name)}
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
