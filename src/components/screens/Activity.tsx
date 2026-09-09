"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Card } from "@/components/ui/Card";
import { InlineAlert } from "@/components/ui/primitives";
import Image from "next/image";
import { formatUnits } from "viem";
import { StockLogo } from "@/components/brand/StockLogo";
import { StockValue } from "./StockValue";
import { display } from "@/lib/chain/amounts";
import { activityLabel, activityExplorerUrl } from "@/lib/chain/activity";
import type { Activity as ActivityItem, MarketPosition } from "@/lib/chain/types";
import { ChevronRight } from "lucide-react";
export function Activity() {
  const { history, historyError, positions } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const item = history.find((a) => a.id === selected);
  const explorerUrl = item && activityExplorerUrl(item.chainId, item.hash);
  return (
    <div className="page animate-fade-up">
      <h1 className="display text-2xl text-[var(--ink)]">Activity</h1>
      {historyError && (
        <InlineAlert>History unavailable. Please try again.</InlineAlert>
      )}
      {!history.length && !historyError && (
        <Card className="text-center">
          <p className="font-semibold">Nothing here yet</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Deposits, borrows, and repayments will show up here.
          </p>
        </Card>
      )}
      <div className="surface overflow-hidden">
        {history.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setSelected(a.id)}
            className={`interactive-row flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left ${i ? "border-t border-[var(--border)]" : ""}`}
          >
            <AssetIcon item={a} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{activityLabel(a.label)}</p>
              <p className="text-xs text-[var(--ink-muted)]">
                {new Date(Number(a.timestamp) * 1000).toLocaleDateString()}
              </p>
            </div>
            <ActivityAmount item={a} positions={positions} />
            <ChevronRight size={16} className="text-[var(--ink-subtle)]" />
          </button>
        ))}
      </div>
      {item && (
        <BottomSheet title="Activity details" onClose={() => setSelected(null)}>
          <Card className="space-y-3">
            <p className="text-sm text-[var(--ink-subtle)]">
              {new Date(Number(item.timestamp) * 1000).toLocaleString()}
            </p>
            <div className="flex items-center gap-3">
              <AssetIcon item={item} />
              <h2 className="text-lg font-semibold">{activityLabel(item.label)}</h2>
            </div>
            <ActivityAmount item={item} positions={positions} details />
            {explorerUrl && (
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-blue-600 hover:underline">
                View on Explorer
              </a>
            )}
          </Card>
        </BottomSheet>
      )}
    </div>
  );
}

function AssetIcon({ item }: { item: ActivityItem }) {
  if (!item.asset) return null;
  if (item.asset === "USDC") return <Image src="/brand/usdc.svg" alt="USDC" width={32} height={32} className="shrink-0" />;
  return <span role="img" aria-label={item.asset}><StockLogo ticker={item.asset.replace(/c$/, "")} size={32} /></span>;
}

function ActivityAmount({ item, positions, details = false }: { item: ActivityItem; positions: MarketPosition[]; details?: boolean }) {
  const position = positions.find(p => p.market.ticker === item.asset);
  const hasAmount = item.amount != null && item.amountDecimals != null && item.asset;
  const amount = hasAmount && details ? formatUnits(item.amount!, item.amountDecimals!) : display(item.amount, item.amountDecimals);
  const hasEstimate = hasAmount && position?.referencePrice && position.referencePrice.answer > 0n;
  return (
    <div className={details ? "text-sm" : "text-right text-sm"}>
      <p className="font-semibold">{hasAmount ? `${amount} ${item.asset}` : item.asset ?? item.detail}</p>
      {hasEstimate && <p className="max-w-40 text-xs text-[var(--ink-muted)]">
        <StockValue position={position} amount={item.amount} hideUnavailable />
        <span className="block">Estimated</span>
      </p>}
    </div>
  );
}
