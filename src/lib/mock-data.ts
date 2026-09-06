import type { ActivityItem, Holding, WalletAsset } from "./types";

/** Stocks sitting in the user's wallet (not yet deposited) */
export const WALLET_ASSETS: WalletAsset[] = [
  { ticker: "NVDA", name: "NVIDIA", available: 1000 },
  { ticker: "AAPL", name: "Apple", available: 750 },
  { ticker: "MSFT", name: "Microsoft", available: 500 },
  { ticker: "META", name: "Meta", available: 300 },
];

export const EMPTY_HOLDINGS: Holding[] = [];

export const DEMO_ACTIVITIES: ActivityItem[] = [];

export function createDemoWalletAddress(): string {
  return "0x7a3F…9c2E";
}
