"use client";

import { useQuery } from "@tanstack/react-query";
import { zeroAddress, type Abi } from "viem";
import { deployment, localEnabled, publicClient } from "@/lib/chain/config";
import { display, marketParams } from "@/lib/chain/amounts";
import lensAbi from "@/lib/chain/generated/StocklineLens.json";
import type { Snapshot } from "@/lib/chain/types";
import styles from "./LandingPage.module.css";

export function LandingBorrowRate() {
  const market = deployment.markets.find((m) => m.enabled && m.ticker === "NVDAc");
  const rate = useQuery({
    queryKey: ["landing-borrow-rate", deployment.chainId, deployment.lens, market?.marketId],
    enabled: !!market,
    queryFn: async () => {
      const blockNumber = await publicClient.getBlockNumber({ cacheTime: 0 });
      const snapshot = await publicClient.readContract({
        address: deployment.lens,
        abi: lensAbi as Abi,
        functionName: "snapshot",
        args: [deployment.morpho, marketParams(market!), zeroAddress, BigInt(market!.uiMaxLtvWad)],
        blockNumber,
      }) as Snapshot;
      if (Math.abs(Date.now() / 1000 - Number(snapshot.timestamp)) > 120)
        throw new Error("Market data is stale");
      return snapshot;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: 1,
  });
  let value = "Loading…";
  if (!market || rate.isError) value = "Unavailable";
  else if (rate.data) value = `${display(rate.data.borrowAprWad, 16, 2)}%`;
  return (
    <div className={styles.liveRate} aria-label="NVDAc borrowing interest rate">
      <div><span>{localEnabled ? "Demo" : "NVDAc / USDC"} · Variable borrow APR</span><strong>{value}</strong></div>
      <p>Annualized interest · Refreshes every 30s</p>
      {rate.data && !rate.isError && <p>As of {new Date(Number(rate.data.timestamp) * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Rate can change</p>}
    </div>
  );
}
