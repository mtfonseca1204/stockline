"use client";

import { useEffect, useRef, useState } from "react";

export function NvdaReferenceChart() {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "unavailable">("loading");

  useEffect(() => {
    const container = host.current!;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.async = true;
    script.textContent = JSON.stringify({
      symbols: [["NVIDIA", "NASDAQ:NVDA|15"]],
      dateRanges: ["1w|15"],
      chartOnly: true,
      width: "100%",
      height: 150,
      locale: "en",
      colorTheme: "light",
      isTransparent: true,
      autosize: false,
      showVolume: false,
      showMA: false,
      hideDateRanges: true,
      hideMarketStatus: false,
      hideSymbolLogo: true,
      scalePosition: "right",
      scaleMode: "Normal",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      chartType: "line",
      lineWidth: 2,
      lineType: 0,
    });
    const timeout = window.setTimeout(() => setStatus("unavailable"), 15000);
    script.onload = () => { clearTimeout(timeout); setStatus("loaded"); };
    script.onerror = () => { clearTimeout(timeout); setStatus("unavailable"); };
    container.appendChild(script);
    return () => {
      clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      container.replaceChildren();
    };
  }, []);

  return (
    <section aria-label="NVDA underlying stock reference chart" className="rounded-xl border border-[var(--border)] px-3 py-2">
      <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
        <span className="font-medium">NVDA stock · USD</span>
        <span>1W · market sessions</span>
      </div>
      {status === "loading" && <p role="status" className="py-2 text-xs text-[var(--ink-muted)]">Loading price history…</p>}
      {status === "unavailable" && <p role="status" className="py-3 text-xs text-[var(--ink-muted)]">Price history unavailable.</p>}
      <div ref={host} className={`tradingview-widget-container ${status === "unavailable" ? "hidden" : "min-h-[150px]"}`} />
      <p className="mt-1 text-[10px] leading-relaxed text-[var(--ink-muted)]">
        Underlying stock, not the collateral oracle. Data may be delayed; closed sessions have no trades.{" "}
        <a href="https://www.tradingview.com/symbols/NASDAQ-NVDA/" target="_blank" rel="noopener noreferrer" className="underline">NVDA by TradingView</a>
      </p>
    </section>
  );
}
