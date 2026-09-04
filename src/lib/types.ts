export type AppView =
  | "landing"
  | "home"
  | "portfolio"
  | "borrow"
  | "activity"
  | "deposit"
  | "withdraw"
  | "loan"
  | "stock";

export type WalletProvider = "coinbase" | "metamask" | "walletconnect";

export type ActivityStatus = "confirmed" | "pending" | "failed";

export type AlertTone = "healthy" | "yield" | "warning" | "critical";

export interface Holding {
  ticker: string;
  name: string;
  quantity: number;
  price: number;
  change24h: number;
  yieldApr: number;
  collateralFactor: number;
  availableToDeposit: number;
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
  autoRepayEnabled: boolean;
  autoRepayPercent: number;
  interestApr: number;
  maxLtv: number;
  liquidationThreshold: number;
  yieldGeneratedMonth: number;
  yieldAppliedMonth: number;
}

export interface AppState {
  connected: boolean;
  walletAddress: string | null;
  walletProvider: WalletProvider | null;
  demoMode: boolean;
  hasPosition: boolean;
  holdings: Holding[];
  credit: CreditState;
  activities: ActivityItem[];
  alerts: AlertItem[];
  view: AppView;
  previousView: AppView;
  selectedTicker: string | null;
  lastYieldPulse: number | null;
}
