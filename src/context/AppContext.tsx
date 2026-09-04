"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  availableCredit,
  availableToWithdraw,
  formatUsd,
  ltv,
  monthlyRepayment,
  monthlyYield,
  portfolioHealth,
  portfolioValue,
  projectedPayoffMonths,
} from "@/lib/calculations";
import { DEMO_ACTIVITIES, DEMO_HOLDINGS } from "@/lib/mock-data";
import type {
  AlertItem,
  AlertTone,
  AppState,
  AppView,
  Holding,
  WalletProvider,
} from "@/lib/types";

interface AppContextValue extends AppState {
  collateral: number;
  debt: number;
  available: number;
  withdrawable: number;
  currentLtv: number;
  yieldMonthly: number;
  repayMonthly: number;
  payoffMonths: number | null;
  health: ReturnType<typeof portfolioHealth>;
  connectWallet: (provider: WalletProvider) => void;
  disconnectWallet: () => void;
  setView: (view: AppView) => void;
  goBack: () => void;
  openStock: (ticker: string) => void;
  enableDemoMode: () => void;
  resetToEmpty: () => void;
  depositStocks: () => void;
  borrowUsdc: (amount: number) => void;
  withdrawStocks: (amount: number) => void;
  setAutoRepay: (enabled: boolean, percent?: number) => void;
  simulateGrowth: (pct?: number) => void;
  simulateYield: (amount?: number) => void;
  pushAlert: (tone: AlertTone, title: string, message: string) => void;
  dismissAlert: (id: string) => void;
  clearYieldPulse: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialCredit = {
  debt: 0,
  originalDebt: 0,
  autoRepayEnabled: true,
  autoRepayPercent: 100,
  interestApr: 0.058,
  maxLtv: 0.55,
  liquidationThreshold: 0.55,
  yieldGeneratedMonth: 0,
  yieldAppliedMonth: 0,
};

function makeAlert(
  tone: AlertTone,
  title: string,
  message: string
): AlertItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tone,
    title,
    message,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(
    null
  );
  const [demoMode, setDemoMode] = useState(false);
  const [hasPosition, setHasPosition] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [credit, setCredit] = useState(initialCredit);
  const [activities, setActivities] = useState<AppState["activities"]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [view, setViewState] = useState<AppView>("landing");
  const [previousView, setPreviousView] = useState<AppView>("landing");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [lastYieldPulse, setLastYieldPulse] = useState<number | null>(null);

  const collateral = portfolioValue(holdings);
  const debt = credit.debt;
  const available = availableCredit(collateral, debt, credit.maxLtv);
  const withdrawable = availableToWithdraw(collateral, debt, credit.maxLtv);
  const currentLtv = ltv(debt, collateral);
  const yieldMonthly = monthlyYield(holdings) || (hasPosition ? 86 : 0);
  const repayMonthly = credit.autoRepayEnabled
    ? monthlyRepayment(yieldMonthly, credit.autoRepayPercent)
    : 0;
  const payoffMonths = projectedPayoffMonths(debt, repayMonthly);
  const health = portfolioHealth(holdings, debt);

  const pushAlert = useCallback(
    (tone: AlertTone, title: string, message: string) => {
      setAlerts((prev) => [makeAlert(tone, title, message), ...prev].slice(0, 3));
    },
    []
  );

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearYieldPulse = useCallback(() => setLastYieldPulse(null), []);

  const setView = useCallback((next: AppView) => {
    setViewState((current) => {
      setPreviousView(current);
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    setViewState(previousView === view ? "home" : previousView);
  }, [previousView, view]);

  const openStock = useCallback(
    (ticker: string) => {
      setSelectedTicker(ticker);
      setView("stock");
    },
    [setView]
  );

  const connectWallet = useCallback(
    (provider: WalletProvider) => {
      setConnected(true);
      setWalletProvider(provider);
      setWalletAddress("0x7a3F9c2E4b81d0A6fC12e88B");
      setViewState("home");
      pushAlert(
        "healthy",
        "Wallet connected",
        "You're on Base. Add stocks to see what you can access."
      );
    },
    [pushAlert]
  );

  const disconnectWallet = useCallback(() => {
    setConnected(false);
    setWalletAddress(null);
    setWalletProvider(null);
    setViewState("landing");
  }, []);

  const enableDemoMode = useCallback(() => {
    setDemoMode(true);
    setConnected(true);
    setWalletProvider("coinbase");
    setWalletAddress("0x7a3F9c2E4b81d0A6fC12e88B");
    setHoldings(DEMO_HOLDINGS.map((h) => ({ ...h })));
    setHasPosition(true);
    setCredit({ ...initialCredit });
    setActivities(DEMO_ACTIVITIES.map((a) => ({ ...a })));
    setViewState("home");
    setAlerts([
      makeAlert(
        "healthy",
        "Demo ready",
        "Portfolio loaded with no loan. Borrow, then simulate $100 generated."
      ),
    ]);
  }, []);

  const resetToEmpty = useCallback(() => {
    setDemoMode(false);
    setHoldings([]);
    setHasPosition(false);
    setCredit({ ...initialCredit });
    setActivities([]);
    setConnected(true);
    setViewState("home");
  }, []);

  const depositStocks = useCallback(() => {
    setHoldings(DEMO_HOLDINGS.map((h) => ({ ...h })));
    setHasPosition(true);
    setActivities((prev) => [
      {
        id: `dep-${Date.now()}`,
        date: "Just now",
        label: "Stocks deposited",
        action: "Deposit",
        asset: "Stocks",
        amount: "+$25,480",
        status: "confirmed",
        detail: "Your tokenized stocks now back your Stockline account.",
      },
      ...prev,
    ]);
    pushAlert(
      "healthy",
      "Stocks added",
      "You can now access liquidity without selling."
    );
    setViewState("home");
  }, [pushAlert]);

  const borrowUsdc = useCallback(
    (amount: number) => {
      setCredit((prev) => ({
        ...prev,
        debt: prev.debt + amount,
        originalDebt: prev.originalDebt === 0 ? amount : prev.originalDebt,
      }));
      setHasPosition(true);
      setActivities((prev) => [
        {
          id: `bor-${Date.now()}`,
          date: "Today",
          label: "Borrowed",
          action: "Borrow",
          asset: "USDC",
          amount: `+${formatUsd(amount)} USDC`,
          status: "confirmed",
          detail: "USDC is available in your wallet. Your stocks stay invested.",
        },
        ...prev,
      ]);
      pushAlert(
        "yield",
        "Borrow complete",
        `${formatUsd(amount)} USDC is now available.`
      );
      setViewState("loan");
    },
    [pushAlert]
  );

  const withdrawStocks = useCallback(
    (amount: number) => {
      setHoldings((prev) => {
        const total = portfolioValue(prev);
        if (total <= 0) return prev;
        const ratio = amount / total;
        return prev
          .map((h) => ({
            ...h,
            quantity: h.quantity * (1 - ratio),
          }))
          .filter((h) => h.quantity * h.price >= 1);
      });
      setActivities((prev) => [
        {
          id: `wd-${Date.now()}`,
          date: "Just now",
          label: "Stocks withdrawn",
          action: "Withdraw",
          asset: "Stocks",
          amount: `-${formatUsd(amount)}`,
          status: "confirmed",
        },
        ...prev,
      ]);
      pushAlert(
        "healthy",
        "Withdrawal complete",
        `${formatUsd(amount)} returned while keeping your loan safely backed.`
      );
      setViewState("portfolio");
    },
    [pushAlert]
  );

  const setAutoRepay = useCallback(
    (enabled: boolean, percent = 100) => {
      setCredit((prev) => ({
        ...prev,
        autoRepayEnabled: enabled,
        autoRepayPercent: percent,
      }));
      pushAlert(
        "yield",
        enabled ? "Auto-repay on" : "Auto-repay off",
        enabled
          ? `${percent}% of money generated by your assets goes toward your loan.`
          : "Generated money stays available to you."
      );
    },
    [pushAlert]
  );

  const simulateGrowth = useCallback(
    (pct = 0.1) => {
      setHoldings((prev) =>
        prev.map((h) => ({
          ...h,
          price: Number((h.price * (1 + pct)).toFixed(2)),
          change24h: Number((pct * 100).toFixed(1)),
        }))
      );
      pushAlert(
        "healthy",
        "Portfolio updated",
        `Holdings grew about ${(pct * 100).toFixed(0)}%. Available credit updated.`
      );
    },
    [pushAlert]
  );

  const simulateYield = useCallback(
    (amount = 100) => {
      let applied = 0;
      setCredit((prev) => {
        applied = prev.autoRepayEnabled
          ? amount * (prev.autoRepayPercent / 100)
          : 0;
        return {
          ...prev,
          debt: Math.max(0, prev.debt - applied),
          yieldGeneratedMonth: prev.yieldGeneratedMonth + amount,
          yieldAppliedMonth: prev.yieldAppliedMonth + applied,
        };
      });
      setLastYieldPulse(applied);
      setActivities((prev) => [
        {
          id: `yld-${Date.now()}`,
          date: "Just now",
          label: applied > 0 ? "Applied to loan" : "Money generated",
          action: "Repay",
          asset: "USDC",
          amount: applied > 0 ? `-${formatUsd(applied, 0)} loan` : formatUsd(amount),
          status: "confirmed",
          detail:
            applied > 0
              ? `${formatUsd(amount)} generated → ${formatUsd(applied)} applied to your loan.`
              : `${formatUsd(amount)} generated by your assets.`,
        },
        ...prev,
      ]);
      pushAlert(
        "yield",
        applied > 0 ? "Loan reduced" : "Money generated",
        applied > 0
          ? `${formatUsd(amount)} generated → ${formatUsd(applied)} applied automatically.`
          : `${formatUsd(amount)} generated by your assets.`
      );
    },
    [pushAlert]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      connected,
      walletAddress,
      walletProvider,
      demoMode,
      hasPosition,
      holdings,
      credit,
      activities,
      alerts,
      view,
      previousView,
      selectedTicker,
      lastYieldPulse,
      collateral,
      debt,
      available,
      withdrawable,
      currentLtv,
      yieldMonthly,
      repayMonthly,
      payoffMonths,
      health,
      connectWallet,
      disconnectWallet,
      setView,
      goBack,
      openStock,
      enableDemoMode,
      resetToEmpty,
      depositStocks,
      borrowUsdc,
      withdrawStocks,
      setAutoRepay,
      simulateGrowth,
      simulateYield,
      pushAlert,
      dismissAlert,
      clearYieldPulse,
    }),
    [
      connected,
      walletAddress,
      walletProvider,
      demoMode,
      hasPosition,
      holdings,
      credit,
      activities,
      alerts,
      view,
      previousView,
      selectedTicker,
      lastYieldPulse,
      collateral,
      debt,
      available,
      withdrawable,
      currentLtv,
      yieldMonthly,
      repayMonthly,
      payoffMonths,
      health,
      connectWallet,
      disconnectWallet,
      setView,
      goBack,
      openStock,
      enableDemoMode,
      resetToEmpty,
      depositStocks,
      borrowUsdc,
      withdrawStocks,
      setAutoRepay,
      simulateGrowth,
      simulateYield,
      pushAlert,
      dismissAlert,
      clearYieldPulse,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
