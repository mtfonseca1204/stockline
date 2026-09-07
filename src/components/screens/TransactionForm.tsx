"use client";
import { useState } from "react";
import { stockBuyLink } from "@/lib/chain/buy-link";
import { inputLimit, percentageAmount } from "@/lib/chain/input-limits";
import { StockLogo } from "@/components/brand/StockLogo";
import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
import { ComingSoonMarkets } from "./ComingSoonMarkets";
import { Expandable, EnvPill, InlineAlert, ToggleRow } from "@/components/ui/primitives";
import {
  deployment,
  networkName,
  environmentLabel,
  localEnabled,
} from "@/lib/chain/config";
import { display, errorMessage, parseAmount } from "@/lib/chain/amounts";
import { quoteSale } from "@/lib/chain/service";
import type { Action, Quote } from "@/lib/chain/types";
const names = {
  deposit: "Add Collateral",
  borrow: "How much would you like to borrow?",
  repay: "Repay your loan",
  withdraw: "Withdraw collateral",
};
const subtitles = {
  deposit: "Select the stocks you want to use as collateral.",
  borrow: "Access liquidity without selling your stocks.",
  repay: "Use USDC, or sell part of your collateral to reduce your loan.",
  withdraw: "Take deposited stocks back to your wallet.",
};
type FormAction = keyof typeof names;
export function TransactionForm({ action }: { action: FormAction }) {
  const app = useApp();
  const [selected, setSelected] = useState(
    deployment?.markets.find(
      (m) => m.enabled && m.ticker === app.selectedTicker,
    )?.ticker ??
      deployment?.markets.find((m) => m.enabled)?.ticker ??
      "",
  );
  const [amount, setAmount] = useState("");
  const [sell, setSell] = useState(false);
  const [all, setAll] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);
  const [quote, setQuote] = useState<Quote>();
  const [quoting, setQuoting] = useState(false);
  const market = deployment?.markets.find((m) => m.ticker === selected);
  const buyLink = stockBuyLink(selected);
  const position = app.positions.find((p) => p.market.ticker === selected);
  const s = position?.snapshot;
  const tokenInput = action === "deposit" || action === "withdraw" || sell;
  const decimals = tokenInput ? (market?.collateralDecimals ?? 8) : 6;
  const limit = app.correctNetwork ? inputLimit(action, sell, position) : null;
  const unit = tokenInput ? `${selected} tokens` : "USDC";
  const busy = [
    "review",
    "approval-signature",
    "approval-pending",
    "signature",
    "pending",
  ].includes(app.tx.phase);
  const context = `${app.walletAddress}:${app.correctNetwork}:${selected}:${amount}:${sell}:${all}`;
  const [reviewContext, setReviewContext] = useState("");
  const reviewing = review && reviewContext === context;
  const reset = () => {
    setReview(false);
    setQuote(undefined);
    setError("");
    app.resetTx();
  };
  const submit = async () => {
    if (!market) return;
    setError("");
    try {
      let operation: Action = action;
      if (action === "repay" && all) operation = "repayAll";
      if (sell) operation = "sell";
      const raw = all && !sell ? 0n : parseAmount(amount, decimals);
      await app.run(operation, market, raw, quote);
      setReview(false);
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  const prepare = async () => {
    if (!market || !app.walletAddress) return;
    setQuoting(true);
    setError("");
    try {
      if (!(all && !sell)) parseAmount(amount, decimals);
      if (sell)
        setQuote(
          await quoteSale(
            app.walletAddress,
            market,
            parseAmount(amount, decimals),
            all,
          ),
        );
      setReviewContext(context);
      setReview(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setQuoting(false);
    }
  };
  if (!deployment)
    return (
      <div className="page">
        <h1>Mainnet transactions are not enabled.</h1>
        <p>Deployment and market validation must complete first.</p>
      </div>
    );
  if (app.tx.phase === "confirmed")
    return (
      <div className="page animate-fade-up relative text-center">
        <ConfettiBurst active />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <Check size={28} />
        </div>
        <h1 className="display text-2xl text-[var(--ink)]">
          Transaction confirmed
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Confirmed onchain. Updated balances come from the network.
        </p>
        {app.tx.hash ? (
          <p className="mt-3 break-all text-xs text-[var(--ink-subtle)]">
            {app.tx.hash}
          </p>
        ) : null}
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            reset();
            app.setView("home");
          }}
        >
          Back to Home
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            reset();
            app.setView("portfolio");
          }}
        >
          View Portfolio
        </Button>
      </div>
    );
  return (
    <div className="page animate-fade-up">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]"
        disabled={busy}
        onClick={() => app.setView("home")}
      >
        <ChevronLeft size={16} /> Home
      </button>
      <h1 className="display text-2xl text-[var(--ink)]">{names[action]}</h1>
      <p className="text-sm text-[var(--ink-muted)]">{subtitles[action]}</p>
      <EnvPill>{environmentLabel}</EnvPill>
      <div className="surface overflow-hidden">
        {deployment.markets.map((m, i) => (
          <button
            type="button"
            aria-label={`Select ${m.ticker} market`}
            aria-pressed={selected === m.ticker}
            key={m.marketId}
            disabled={busy || !m.enabled}
            onClick={() => {
              reset();
              setSelected(m.ticker);
            }}
            className={`interactive-row flex w-full items-center gap-3 px-4 py-3.5 text-left ${i ? "border-t border-[var(--border)]" : ""} ${selected === m.ticker ? "bg-[var(--accent-soft)]" : ""}`}
          >
            <StockLogo ticker={m.ticker.replace(/c$/, "")} size={40} />
            <span className="flex-1 font-semibold">
              {m.ticker}
              <span className="block text-xs font-normal text-[var(--ink-muted)]">
                {display(
                  app.positions.find((p) => p.market.marketId === m.marketId)
                    ?.walletCollateral,
                  m.collateralDecimals,
                )}{" "}
                in wallet
              </span>
            </span>
            {!m.enabled && (
              <span className="shrink-0 rounded-full bg-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-muted)]">
                Coming soon
              </span>
            )}
            {selected === m.ticker && (
              <Check size={18} className="text-[var(--accent)]" />
            )}
          </button>
        ))}
        <ComingSoonMarkets />
      </div>
      {action === "deposit" && buyLink && (
        <Card quiet className="space-y-2">
          <p className="text-sm text-[var(--ink-muted)]">
            Need more {selected}?
          </p>
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-semibold text-[var(--accent)] underline underline-offset-4"
          >
            Buy {selected} on Uniswap ↗
          </a>
          <p className="text-xs text-[var(--ink-muted)]">
            Opens Uniswap on Base mainnet. Purchases use real funds. {localEnabled && "They do not appear in this local demo."}
          </p>
        </Card>
      )}
      {!app.correctNetwork && app.connected && (
        <Button onClick={app.switchNetwork}>Switch to {networkName}</Button>
      )}
      {!localEnabled && (
        <Expandable label="When can I borrow?">
          <p>
            Credit is available during Nasdaq regular sessions, with a current
            session price. Closed sessions also pause liquidations. Calendar
            valid through December 31, 2026.
          </p>
        </Expandable>
      )}
      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <StockLogo ticker={selected.replace(/c$/, "")} size={48} />
          <div>
            <h2 className="text-xl">{selected}</h2>
            <p className="text-sm text-[var(--ink-muted)]">
              Available to borrow: {display(s?.availableBorrowRaw)} USDC
            </p>
          </div>
        </div>
        <div className="surface-quiet grid grid-cols-2 gap-3 p-3 text-sm">
          <div>
            <p className="text-xs text-[var(--ink-muted)]">Collateral</p>
            <p className="font-semibold">
              {display(s?.collateralRaw, market?.collateralDecimals)} tokens
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-muted)]">Borrowed</p>
            <p className="font-semibold">{display(s?.debtAssetsRaw)} USDC</p>
          </div>
        </div>
        {action === "repay" && (
          <div className="space-y-2">
            <ToggleRow
              checked={sell}
              disabled={busy}
              title="Sell collateral to repay"
              subtitle="You keep fewer stocks after the sale."
              onChange={(next) => {
                reset();
                setSell(next);
              }}
            />
            <ToggleRow
              checked={all}
              disabled={busy}
              title="Repay all debt"
              onChange={(next) => {
                reset();
                setAll(next);
              }}
            />
          </div>
        )}
        {!(all && !sell) && (
          <label className="block">
            Amount in {unit}
            <input
              aria-label="Amount"
              inputMode="decimal"
              placeholder="0"
              className="mt-3 block w-full bg-transparent py-3 text-4xl font-semibold outline-none"
              value={amount}
              disabled={busy}
              onChange={(e) => {
                reset();
                setAmount(e.target.value);
              }}
            />
          </label>
        )}
        <div className="space-y-3">
          <p className="text-sm text-[var(--ink-muted)]">
            Wallet balance:{" "}
            {display(position?.walletCollateral, market?.collateralDecimals)}{" "}
            {selected} · {display(position?.walletUsdc)} USDC
          </p>
          <p className="text-sm text-[var(--ink-muted)]">
            {sell
              ? "Collateral available to sell"
              : "Available for this operation"}
            :{" "}
            <span className="font-semibold text-[var(--ink)]">
              {display(limit, decimals)} {unit}
            </span>
          </p>
          <div className="flex gap-2">
            {([25, 50, 75, 100] as const).map((pct) => (
              <button
                type="button"
                key={pct}
                disabled={busy || limit == null || limit === 0n}
                className="chip flex-1 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)]"
                onClick={() => {
                  reset();
                  if (limit == null) return;
                  const fullRepayment =
                    action === "repay" &&
                    !sell &&
                    pct === 100 &&
                    !!s &&
                    s.debtAssetsRaw > 0n &&
                    limit === s.debtAssetsRaw;
                  if (action === "repay" && !sell) setAll(fullRepayment);
                  setAmount(display(percentageAmount(limit, pct), decimals));
                }}
              >
                {pct === 100 ? "MAX" : `${pct}%`}
              </button>
            ))}
          </div>
          {sell && (
            <p className="text-xs text-[var(--ink-muted)]">
              Percentages use your deposited collateral. The quote must preserve
              a healthy position.
            </p>
          )}
        </div>
        {action === "withdraw" && (
          <p>
            The transaction must preserve the market health requirement. The
            wallet simulation checks the requested amount.
          </p>
        )}
      </Card>
      {sell && (
        <Card className="space-y-3">
          <p className="text-sm text-[var(--ink-muted)]">
            Selling collateral reduces the number of stocks you hold. Ordinary
            USDC repayment does not need this extra permission.
          </p>
          <Button
            variant="soft"
            className="w-full"
            disabled={busy || !app.correctNetwork}
            onClick={async () => {
              try {
                if (market) {
                  await app.run("authorize", market);
                  app.resetTx();
                }
              } catch (e) {
                setError(errorMessage(e));
              }
            }}
          >
            Allow sale repayment
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            disabled={busy || !app.correctNetwork}
            onClick={async () => {
              try {
                if (market) {
                  await app.run("revoke", market);
                  app.resetTx();
                }
              } catch (e) {
                setError(errorMessage(e));
              }
            }}
          >
            Remove permission
          </Button>
          <Expandable label="Technical details">
            <p className="break-all text-xs">Adapter: {deployment.adapter}</p>
          </Expandable>
        </Card>
      )}
      {reviewing && (
        <Card className="space-y-3">
          <h2 className="text-lg text-[var(--ink)]">Review your transaction</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            {action === "deposit"
              ? "You are depositing"
              : action === "borrow"
                ? "You are borrowing"
                : action === "repay"
                  ? "You are repaying"
                  : "You are withdrawing"}{" "}
            <span className="font-semibold text-[var(--ink)]">
              {all ? "all remaining debt" : `${amount} ${unit}`}
            </span>
            {selected ? ` · ${selected}` : ""}
          </p>
          {quote && (
            <div className="space-y-2 text-sm text-[var(--ink-muted)]">
              <p>
                Tokens sold:{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {display(quote.request.collateralAssetsToSell, decimals)}
                </span>
              </p>
              <p>
                Minimum received:{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {display(quote.request.minUsdcOut)} USDC
                </span>
              </p>
              <p>
                Loan after:{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {display(quote.debtAfter)} USDC
                </span>
              </p>
              <Expandable label="More details">
                <p>
                  Remaining collateral:{" "}
                  {display(quote.collateralAfter, decimals)} tokens
                </p>
                <p>
                  Health after:{" "}
                  {quote.healthAfter === null
                    ? "No debt"
                    : display(quote.healthAfter, 18)}
                </p>
                <p>
                  Quote expires:{" "}
                  {new Date(
                    Number(quote.request.deadline) * 1000,
                  ).toLocaleTimeString()}
                </p>
                <p>
                  Gas estimate:{" "}
                  {quote.gasEstimate?.toString() ??
                    "Allow sale repayment, then request a new quote"}{" "}
                  units. Your wallet shows the fee before you sign.
                </p>
              </Expandable>
            </div>
          )}
          <Button
            size="lg"
            className="w-full"
            disabled={busy || !app.correctNetwork}
            onClick={submit}
          >
            Confirm transaction
          </Button>
        </Card>
      )}
      {!reviewing && (
        <Button
          size="lg"
          className="w-full"
          disabled={
            !app.connected || !app.correctNetwork || !s || busy || quoting || (action === "borrow" && !s?.oracleValid)
          }
          onClick={prepare}
        >
          {quoting ? "Requesting quote…" : "Review"}
        </Button>
      )}
      {busy && (
        <p
          role="status"
          className="surface flex items-center gap-3 p-4 text-sm text-[var(--ink)]"
        >
          <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
          {app.tx.phase.replaceAll("-", " ")}. Waiting for wallet or receipt.
        </p>
      )}
      {app.tx.hash && (
        <p className="break-all text-xs text-[var(--ink-subtle)]">
          {app.tx.hash}
        </p>
      )}
      {(error || app.tx.message) && (
        <InlineAlert>{error || app.tx.message}</InlineAlert>
      )}
    </div>
  );
}
