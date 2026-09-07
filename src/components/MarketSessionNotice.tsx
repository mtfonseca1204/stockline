"use client";
import { useQuery } from "@tanstack/react-query";
import { parseAbi } from "viem";
import { Clock3 } from "lucide-react";
import { deployment, localEnabled, publicClient } from "@/lib/chain/config";
import { sessionStatus } from "@/lib/chain/session";
import calendar from "../../contracts/config/nasdaq-pilot-calendar.json";
import mainnet from "@/lib/chain/generated/base.json";
const abi = parseAbi([
  "function paused() view returns (bool)",
  "function price() view returns (uint256)",
]);
export function MarketSessionNotice() {
  const status = useQuery({
    queryKey: ["market-session", deployment.chainId, mainnet.guard],
    enabled: !localEnabled,
    refetchInterval: 15000,
    queryFn: async () => {
      const block = await publicClient.getBlock({ blockTag: "latest" });
      const session = sessionStatus(calendar.sessions, Number(block.timestamp));
      const [paused, price] = await Promise.all([
        publicClient.readContract({
          address: mainnet.guard as `0x${string}`,
          abi,
          functionName: "paused",
          blockNumber: block.number,
        }),
        publicClient
          .readContract({
            address: deployment.markets[0].oracle,
            abi,
            functionName: "price",
            blockNumber: block.number,
          })
          .catch(() => null),
      ]);
      return { session, paused, valid: price !== null && price > 0n };
    },
  });
  if (localEnabled) return null;
  let title = "Checking market status";
  let detail = "Borrowing requires an open Nasdaq session and a valid price.";
  const data = status.data;
  if (status.isError) {
    title = "Market status unavailable";
    detail =
      "Could not verify the network. Borrowing availability is not confirmed.";
  } else if (data) {
    const time =
      data.session.at === null
        ? ""
        : new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "America/Sao_Paulo",
          }).format(new Date(data.session.at * 1000));
    if (data.paused) {
      title = "Market paused";
      detail =
        "Emergency pause is active. Borrowing and liquidations are unavailable.";
    } else if (data.session.state === "closed") {
      title = "Market closed";
      detail = `Next opening: ${time} (Brasília, UTC−3). Borrowing and liquidations require a fresh price after opening.`;
    } else if (data.session.state === "unavailable") {
      title = "Market schedule unavailable";
      detail =
        "Calendar coverage has ended. Borrowing and liquidations remain unavailable.";
    } else if (!data.valid) {
      title = "Session open · Awaiting a valid oracle";
      detail = `Closes ${time} (Brasília, UTC−3). Borrowing and liquidations remain unavailable until price and safety checks pass.`;
    } else {
      title = "Market open";
      detail = `Closes ${time} (Brasília, UTC−3). Borrowing depends on your collateral and available liquidity.`;
    }
  }
  return (
    <div role="status" className="mx-auto w-full max-w-5xl px-4 py-3">
      <div className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
        <Clock3 size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-[var(--ink-muted)]">{detail}</p>
        </div>
      </div>
    </div>
  );
}
