import type { Holding } from "./types";

export const MAX_LTV = 0.55;
export const INTEREST_APR = 0.058;
export const MONTHLY_YIELD_BASE = 86;

export function portfolioValue(holdings: Holding[]): number {
  return Math.round(
    holdings.reduce((sum, h) => sum + h.quantity * h.price, 0)
  );
}

export function holdingValue(h: Holding): number {
  return Math.round(h.quantity * h.price);
}

export function ltv(debt: number, collateral: number): number {
  if (collateral <= 0) return 0;
  return debt / collateral;
}

export function availableCredit(
  collateral: number,
  debt: number,
  maxLtv = MAX_LTV
): number {
  return Math.max(0, Math.round(maxLtv * collateral - debt));
}

/** How much portfolio value can be withdrawn while keeping the loan safely backed */
export function availableToWithdraw(
  collateral: number,
  debt: number,
  maxLtv = MAX_LTV
): number {
  if (debt <= 0) return collateral;
  const minCollateral = debt / maxLtv;
  return Math.max(0, Math.round(collateral - minCollateral));
}

export function maxSafeBorrow(
  collateral: number,
  debt: number,
  maxLtv = MAX_LTV
): number {
  return availableCredit(collateral, debt, maxLtv);
}

export function safetyBuffer(
  currentLtv: number,
  liquidationThreshold = MAX_LTV
): number {
  return Math.max(0, liquidationThreshold - currentLtv);
}

export function monthlyYield(holdings: Holding[]): number {
  const raw = holdings.reduce((sum, h) => {
    const value = holdingValue(h);
    return sum + (value * h.yieldApr) / 12;
  }, 0);
  return Math.round(raw);
}

export function monthlyRepayment(yieldAmount: number, autoRepayPercent: number) {
  return yieldAmount * (autoRepayPercent / 100);
}

export function projectedPayoffMonths(
  debt: number,
  monthlyRepay: number
): number | null {
  if (monthlyRepay <= 0 || debt <= 0) return null;
  return Math.ceil(debt / monthlyRepay);
}

export function projectedDebtAtMonth(
  debt: number,
  monthlyRepay: number,
  month: number
): number {
  return Math.max(0, debt - monthlyRepay * month);
}

export function diversificationScore(holdings: Holding[]): number {
  const total = portfolioValue(holdings);
  if (total <= 0 || holdings.length === 0) return 0;
  const weights = holdings.map((h) => holdingValue(h) / total);
  const herfindahl = weights.reduce((s, w) => s + w * w, 0);
  // 1 holding ~ 1.0 HHI → low score; equal 4 holdings ~ 0.25 → high
  const score = Math.round((1 - (herfindahl - 0.25) / 0.75) * 100);
  return Math.min(100, Math.max(40, score));
}

export function liquidityScore(holdings: Holding[]): number {
  if (holdings.length === 0) return 0;
  const avg =
    holdings.reduce((s, h) => s + h.collateralFactor, 0) / holdings.length;
  return Math.round(avg * 100 + 20);
}

export function volatilityScore(holdings: Holding[]): number {
  if (holdings.length === 0) return 0;
  const avgAbsChange =
    holdings.reduce((s, h) => s + Math.abs(h.change24h), 0) / holdings.length;
  // Lower volatility → higher score
  const score = Math.round(95 - avgAbsChange * 8);
  return Math.min(100, Math.max(40, score));
}

export function collateralQualityScore(holdings: Holding[]): number {
  if (holdings.length === 0) return 0;
  const avg =
    holdings.reduce((s, h) => s + h.collateralFactor, 0) / holdings.length;
  return Math.round(avg * 100 + 15);
}

export function portfolioHealth(
  holdings: Holding[],
  debt: number
): {
  overall: number;
  diversification: number;
  liquidity: number;
  volatility: number;
  collateralQuality: number;
  status: "Healthy" | "Caution" | "High risk";
} {
  const collateral = portfolioValue(holdings);
  const currentLtv = ltv(debt, collateral);
  const diversification = diversificationScore(holdings);
  const liquidity = Math.min(100, liquidityScore(holdings));
  const volatility = volatilityScore(holdings);
  const collateralQuality = Math.min(100, collateralQualityScore(holdings));

  let overall = Math.round(
    diversification * 0.22 +
      liquidity * 0.18 +
      volatility * 0.22 +
      collateralQuality * 0.18 +
      Math.max(0, 100 - currentLtv * 200) * 0.2
  );

  overall = Math.min(100, Math.max(0, overall));

  let status: "Healthy" | "Caution" | "High risk" = "Healthy";
  if (currentLtv >= 0.48 || overall < 55) status = "High risk";
  else if (currentLtv >= 0.38 || overall < 70) status = "Caution";

  return {
    overall,
    diversification,
    liquidity,
    volatility,
    collateralQuality,
    status,
  };
}

export function formatUsd(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPct(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatSignedUsd(value: number, digits = 0): string {
  const formatted = formatUsd(Math.abs(value), digits);
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
