"use client";
import { StockValue } from "./StockValue";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/context/AppContext";
import { deployment, localEnabled } from "@/lib/chain/config";
import legacy from "@/lib/chain/generated/legacy-base.json";
import { readPositions } from "@/lib/chain/service";
import { display, errorMessage } from "@/lib/chain/amounts";
import type { MarketConfig } from "@/lib/chain/types";
import { Button } from "@/components/ui/Button";
const market = legacy.markets[0] as MarketConfig;
export function LegacyPosition() {
  const app = useApp();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const enabled =
    !localEnabled &&
    !!deployment.alwaysOpen &&
    !!app.walletAddress &&
    app.correctNetwork;
  const position = useQuery({
    queryKey: ["legacy-position", app.walletAddress, app.correctNetwork],
    enabled,
    queryFn: () => readPositions(app.walletAddress!, [market]),
    refetchInterval: 12000,
  });
  if (!enabled) return null;
  const p = position.data?.[0];
  if (position.isError || p?.error)
    return (
      <p role="alert">
        Could not read your old market position. Retry before assuming it is
        empty.
      </p>
    );
  if (!p?.snapshot || (!p.snapshot.collateralRaw && !p.snapshot.borrowShares))
    return null;
  const s = p.snapshot;
  async function exit() {
    setBusy(true);
    setError("");
    app.resetTx();
    try {
      await app.run(
        s.borrowShares ? "repayAll" : "withdraw",
        market,
        s.collateralRaw,
      );
      await position.refetch();
      app.resetTx();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="surface mx-4 my-3 space-y-2 p-4 text-sm">
      <p className="font-semibold">Your old NVDAc market position</p>
      <p>
        {display(s.collateralRaw, 8)} NVDAc · {display(s.debtAssetsRaw)} USDC
        debt
      </p>
      <StockValue position={p} amount={s.collateralRaw} />
      <p>
        The old market remains separate. Repay any debt, withdraw to your
        wallet, then deposit into the new 24/7 market. Your collateral is not
        moved automatically.
      </p>
      <Button disabled={busy} onClick={exit}>
        {busy
          ? "Waiting for confirmation…"
          : s.borrowShares
            ? "Repay old market debt"
            : "Withdraw old collateral"}
      </Button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
