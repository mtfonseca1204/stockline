export type AppView =
  | "landing"
  | "home"
  | "portfolio"
  | "borrow"
  | "activity"
  | "deposit"
  | "withdraw"
  | "loan"
  | "stock"
  | "repay";

export type WalletProvider = "coinbase" | "metamask" | "walletconnect";

export type ActivityStatus = "confirmed" | "pending" | "failed";

export type AlertTone = "healthy" | "yield" | "warning" | "critical";

export interface Holding {
  ticker: string;
  name: string;
  /** USD value currently deposited as collateral */
  value: number;
  /** USD value at deposit time — used for gains */
  costBasis: number;
}

export interface WalletAsset {
  ticker: string;
  name: string;
  available: number;
}

export interface ActivityItem {
  id: string;
  date: string;
  label: string;
  action: string;
  asset: string;
  amount: string;
  status: ActivityStatus;
  detail?: string;
}

export interface AlertItem {
  id: string;
  tone: AlertTone;
  title: string;
  message: string;
}

export interface CreditState {
  debt: number;
  originalDebt: number;
  /** Borrow power as fraction of collateral (MVP: 50%) */
  maxLtv: number;
}

export interface AppState {
  connected: boolean;
  walletAddress: string | null;
  walletProvider: WalletProvider | null;
  holdings: Holding[];
  walletAssets: WalletAsset[];
  credit: CreditState;
  activities: ActivityItem[];
  alerts: AlertItem[];
  view: AppView;
  previousView: AppView;
  selectedTicker: string | null;
}
