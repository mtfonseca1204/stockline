import type { Holding } from "./types";

/** MVP: borrow up to 50% of collateral */
export const BORROW_RATIO = 0.5;

export function portfolioValue(holdings: Holding[]): number {
  return Math.round(holdings.reduce((sum, h) => sum + h.value, 0));
}

export function costBasisTotal(holdings: Holding[]): number {
  return Math.round(holdings.reduce((sum, h) => sum + h.costBasis, 0));
}

/** Unrealized gains from appreciation (never negative) */
export function unrealizedGains(holdings: Holding[]): number {
  return Math.max(0, portfolioValue(holdings) - costBasisTotal(holdings));
}

export function availableCredit(
  collateral: number,
  debt: number,
  ratio = BORROW_RATIO
): number {
  return Math.max(0, Math.round(collateral * ratio - debt));
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

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
