import catalog from "../../../contracts/config/base-fork.json";
import { deployment } from "@/lib/chain/config";
import { StockLogo } from "@/components/brand/StockLogo";
export function ComingSoonMarkets() {
  return (
    <>
      {catalog.markets
        .filter(
          (asset) =>
            !deployment.markets.some(
              (m) =>
                m.collateralToken.toLowerCase() === asset.token.toLowerCase() ||
                m.ticker === asset.ticker,
            ),
        )
        .map((asset) => (
          <div
            key={asset.token}
            className="flex items-center gap-3 border-t border-[var(--border)] px-4 py-3.5"
          >
            <StockLogo ticker={asset.ticker.replace(/c$/, "")} size={40} />
            <span className="flex-1 font-semibold">{asset.ticker}</span>
            <span className="rounded-full bg-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--ink-muted)]">
              Coming soon
            </span>
          </div>
        ))}
    </>
  );
}
