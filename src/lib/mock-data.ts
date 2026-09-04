import type { ActivityItem, Holding } from "./types";

export const DEMO_HOLDINGS: Holding[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    quantity: 42.0408163265,
    price: 196,
    change24h: 0.8,
    yieldApr: 0.0425,
    collateralFactor: 0.75,
    availableToDeposit: 21.4285714286,
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    quantity: 8.9001692047,
    price: 886.5,
    change24h: 1.6,
    yieldApr: 0.0385,
    collateralFactor: 0.7,
    availableToDeposit: 4.2865194585,
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    quantity: 10.3996931784,
    price: 521.15,
    change24h: -0.4,
    yieldApr: 0.0405,
    collateralFactor: 0.72,
    availableToDeposit: 4.0291653077,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    quantity: 9.3996656302,
    price: 418.1,
    change24h: 0.5,
    yieldApr: 0.0415,
    collateralFactor: 0.78,
    availableToDeposit: 5.0222439617,
  },
];

export const EMPTY_HOLDINGS: Holding[] = [];

export const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: "a1",
    date: "Today",
    label: "Borrowed 4,000 USDC",
    action: "Borrow",
    asset: "USDC",
    amount: "$4,000",
    status: "confirmed",
  },
  {
    id: "a2",
    date: "Yesterday",
    label: "Deposited 10 NVDA",
    action: "Deposit",
    asset: "NVDA",
    amount: "10 shares",
    status: "confirmed",
  },
  {
    id: "a3",
    date: "Aug 28",
    label: "Auto-repay enabled",
    action: "Settings",
    asset: "—",
    amount: "100%",
    status: "confirmed",
  },
  {
    id: "a4",
    date: "Aug 21",
    label: "Yield generated: $21.40",
    action: "Yield",
    asset: "Portfolio",
    amount: "$21.40",
    status: "confirmed",
  },
  {
    id: "a5",
    date: "Aug 20",
    label: "Collateral deposited",
    action: "Deposit",
    asset: "Mixed",
    amount: "$25,480",
    status: "confirmed",
  },
];

export function createDemoWalletAddress(): string {
  return "0x7a3F…9c2E";
}
