export type WalletProvider = "coinbase" | "metamask" | "walletconnect";
export type ActivityStatus = "confirmed" | "pending" | "failed";
export type AlertTone = "healthy" | "yield" | "warning" | "critical";
export type ChangeKind = "borrow" | "deposit" | "withdraw" | "yield" | "growth" | "settings" | "connect";

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
}

export interface AlertItem {
  id: string;
  tone: AlertTone;
  title: string;
  message: string;
}

export interface ChangeLogEntry {
  id: string;
  kind: ChangeKind;
  title: string;
  detail: string;
  completed: boolean;
  at: number;
  debtDelta?: number;
  portfolioDelta?: number;
}

export interface CreditState {
  debt: number;
  originalDebt: number;
  autoRepayEnabled: boolean;
  autoRepayPercent: number;
  interestApr: number;
  maxLtv: number;
  liquidationThreshold: number;
}
