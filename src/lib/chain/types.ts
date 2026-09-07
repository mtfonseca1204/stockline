import type { Address, Hex } from "viem";
export type MarketConfig = {
  ticker: string;
  enabled: boolean;
  collateralToken: Address;
  collateralDecimals: number;
  loanToken: Address;
  loanDecimals: number;
  oracle: Address;
  feed: Address;
  irm: Address;
  lltv: string;
  uiMaxLtvWad: string;
  marketId: Hex;
};
export type Deployment = {
  schemaVersion: number;
  chainId: number;
  mode: string;
  productionReady: boolean;
  morpho: Address;
  usdc: Address;
  lens: Address;
  adapter: Address;
  swap: Address;
  indexFromBlock: number;
  markets: MarketConfig[];
};
export type Snapshot = {
  collateralRaw: bigint;
  borrowShares: bigint;
  debtAssetsRaw: bigint;
  collateralValueUsdcRaw: bigint;
  availableBorrowRaw: bigint;
  liquidity: bigint;
  healthFactorWad: bigint;
  borrowAprWad: bigint;
  price: bigint;
  snapshotBlock: bigint;
  timestamp: bigint;
  oracleValid: boolean;
};
export type MarketPosition = {
  market: MarketConfig;
  snapshot: Snapshot | null;
  walletCollateral: bigint | null;
  walletUsdc: bigint | null;
  error: string | null;
};
export type Action =
  | "deposit"
  | "borrow"
  | "repay"
  | "repayAll"
  | "withdraw"
  | "sell"
  | "authorize"
  | "revoke";
export type RepayRequest = {
  marketId: Hex;
  repayAssets: bigint;
  repayAll: boolean;
  maxRepayAssets: bigint;
  collateralAssetsToSell: bigint;
  minUsdcOut: bigint;
  minHealthFactorWad: bigint;
  deadline: bigint;
  routeData: Hex;
};
export type Quote = {
  request: RepayRequest;
  owner: Address;
  block: bigint;
  output: bigint;
  debtAfter: bigint;
  collateralAfter: bigint;
  healthAfter: bigint | null;
  gasEstimate: bigint | null;
};
export type TxState = {
  phase:
    | "idle"
    | "review"
    | "approval-signature"
    | "approval-pending"
    | "approval-confirmed"
    | "signature"
    | "pending"
    | "confirmed"
    | "failed";
  hash?: Hex;
  message?: string;
  context?: string;
};
export type Activity = {
  id: string;
  hash: Hex;
  block: bigint;
  label: string;
  detail: string;
  timestamp: bigint;
};
