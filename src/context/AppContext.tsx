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
  currentLtv: number;
  yieldMonthly: number;
  repayMonthly: number;
  payoffMonths: number | null;
  health: ReturnType<typeof portfolioHealth>;
  connectWallet: (provider: WalletProvider) => void;
  disconnectWallet: () => void;
  setView: (view: AppView) => void;
  goBack: () => void;
  enableDemoMode: () => void;
  resetToEmpty: () => void;
  depositCollateral: (selections: Record<string, number>) => void;
  borrowUsdc: (amount: number) => void;
  withdrawCollateral: (amount: number) => void;
  setAutoRepay: (enabled: boolean, percent?: number) => void;
  simulateGrowth: (pct?: number) => void;
  simulateYield: (amount?: number) => void;
  pushAlert: (tone: AlertTone, title: string, message: string) => void;
  dismissAlert: (id: string) => void;
  updateHoldingPrices: (multiplier: number) => void;
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

  const collateral = portfolioValue(holdings);
  const debt = credit.debt;
  const available = availableCredit(collateral, debt, credit.maxLtv);
  const currentLtv = ltv(debt, collateral);
  const yieldMonthly = monthlyYield(holdings);
  const repayMonthly = credit.autoRepayEnabled
    ? monthlyRepayment(yieldMonthly, credit.autoRepayPercent)
    : 0;
  const payoffMonths = projectedPayoffMonths(debt, repayMonthly);
  const health = portfolioHealth(holdings, debt);

  const pushAlert = useCallback(
    (tone: AlertTone, title: string, message: string) => {
      setAlerts((prev) => [makeAlert(tone, title, message), ...prev].slice(0, 4));
    },
    []
  );

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const setView = useCallback((next: AppView) => {
    setViewState((current) => {
      setPreviousView(current);
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    setViewState(previousView === view ? "dashboard" : previousView);
  }, [previousView, view]);

  const connectWallet = useCallback(
    (provider: WalletProvider) => {
      setConnected(true);
      setWalletProvider(provider);
      setWalletAddress("0x7a3F9c2E4b81d0A6fC12e88B");
      if (demoMode || holdings.length > 0) {
        setViewState("dashboard");
      } else {
        setViewState("empty");
      }
      pushAlert(
        "healthy",
        "Wallet connected",
        "You're on Base. Start by depositing tokenized stocks."
      );
    },
    [demoMode, holdings.length, pushAlert]
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
    setCredit({
      ...initialCredit,
      debt: 4000,
      originalDebt: 4000,
      autoRepayEnabled: true,
      autoRepayPercent: 100,
    });
    setActivities(DEMO_ACTIVITIES.map((a) => ({ ...a })));
    setViewState("dashboard");
    setAlerts([
      makeAlert(
        "healthy",
        "Demo Mode",
        "Pre-loaded portfolio for presentation. Use demo controls to simulate events."
      ),
      makeAlert(
        "healthy",
        "Healthy",
        "Your portfolio remains well collateralized."
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
    setViewState("empty");
  }, []);

  const depositCollateral = useCallback(
    (selections: Record<string, number>) => {
      setHoldings((prev) => {
        const next = prev.map((h) => {
          const addValue = selections[h.ticker] ?? 0;
          if (addValue <= 0) return h;
          const addQty = addValue / h.price;
          return {
            ...h,
            quantity: h.quantity + addQty,
            availableToDeposit: Math.max(0, h.availableToDeposit - addQty),
          };
        });

        // If empty portfolio, seed from demo tickers with deposited amounts
        if (prev.length === 0) {
          return DEMO_HOLDINGS.map((h) => {
            const addValue = selections[h.ticker] ?? 0;
            const addQty = addValue / h.price;
            return {
              ...h,
              quantity: addQty,
              availableToDeposit: Math.max(0, h.availableToDeposit - addQty),
            };
          }).filter((h) => h.quantity > 0);
        }
        return next;
      });

      const deposited = Object.values(selections).reduce((a, b) => a + b, 0);
      setHasPosition(true);
      setActivities((prev) => [
        {
          id: `dep-${Date.now()}`,
          date: "Just now",
          label: `Deposited collateral ${formatUsd(deposited)}`,
          action: "Deposit",
          asset: "Stocks",
          amount: formatUsd(deposited),
          status: "confirmed",
        },
        ...prev,
      ]);
      pushAlert(
        "healthy",
        "Collateral added",
        `${formatUsd(deposited)} in tokenized stocks is now securing your credit line.`
      );
      setViewState("portfolio");
    },
    [pushAlert]
  );

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
          date: "Just now",
          label: `Borrowed ${formatUsd(amount)} USDC`,
          action: "Borrow",
          asset: "USDC",
          amount: formatUsd(amount),
          status: "confirmed",
        },
        ...prev,
      ]);
      pushAlert(
        "yield",
        "Borrow confirmed",
        `${formatUsd(amount)} USDC is available. Auto-repay can help pay it back over time.`
      );
      setViewState("credit");
    },
    [pushAlert]
  );

  const withdrawCollateral = useCallback(
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
          label: `Withdrew collateral ${formatUsd(amount)}`,
          action: "Withdraw",
          asset: "Stocks",
          amount: formatUsd(amount),
          status: "confirmed",
        },
        ...prev,
      ]);
      pushAlert(
        "healthy",
        "Withdrawal complete",
        `${formatUsd(amount)} collateral released while keeping your loan safely backed.`
      );
      setViewState("credit");
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
      setActivities((prev) => [
        {
          id: `ar-${Date.now()}`,
          date: "Just now",
          label: enabled
            ? `Auto-repay set to ${percent}%`
            : "Auto-repay disabled",
          action: "Settings",
          asset: "—",
          amount: enabled ? `${percent}%` : "Off",
          status: "confirmed",
        },
        ...prev,
      ]);
      pushAlert(
        "yield",
        enabled ? "Auto-Repay on" : "Auto-Repay off",
        enabled
          ? `${percent}% of generated yield will go toward your debt.`
          : "Yield remains available to you instead of repayment."
      );
    },
    [pushAlert]
  );

  const updateHoldingPrices = useCallback((multiplier: number) => {
    setHoldings((prev) =>
      prev.map((h) => ({
        ...h,
        price: Number((h.price * multiplier).toFixed(2)),
        change24h: Number(((multiplier - 1) * 100).toFixed(1)),
      }))
    );
  }, []);

  const simulateGrowth = useCallback(
    (pct = 0.1) => {
      updateHoldingPrices(1 + pct);
      pushAlert(
        "healthy",
        "Portfolio growth simulated",
        `Holdings increased by ${(pct * 100).toFixed(0)}%. Available credit and health updated.`
      );
    },
    [pushAlert, updateHoldingPrices]
  );

  const simulateYield = useCallback(
    (amount = 100) => {
      setCredit((prev) => {
        const applied = prev.autoRepayEnabled
          ? amount * (prev.autoRepayPercent / 100)
          : 0;
        const newDebt = Math.max(0, prev.debt - applied);
        return { ...prev, debt: newDebt };
      });
      setActivities((prev) => [
        {
          id: `yld-${Date.now()}`,
          date: "Just now",
          label: `Yield generated: ${formatUsd(amount, 2)}`,
          action: "Yield",
          asset: "Portfolio",
          amount: formatUsd(amount, 2),
          status: "confirmed",
        },
        ...prev,
      ]);
      pushAlert(
        "yield",
        "Yield generated",
        `Your portfolio generated ${formatUsd(amount, 2)} in yield. Auto-repay applied it to your debt.`
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
      collateral,
      debt,
      available,
      currentLtv,
      yieldMonthly,
      repayMonthly,
      payoffMonths,
      health,
      connectWallet,
      disconnectWallet,
      setView,
      goBack,
      enableDemoMode,
      resetToEmpty,
      depositCollateral,
      borrowUsdc,
      withdrawCollateral,
      setAutoRepay,
      simulateGrowth,
      simulateYield,
      pushAlert,
      dismissAlert,
      updateHoldingPrices,
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
      collateral,
      debt,
      available,
      currentLtv,
      yieldMonthly,
      repayMonthly,
      payoffMonths,
      health,
      connectWallet,
      disconnectWallet,
      setView,
      goBack,
      enableDemoMode,
      resetToEmpty,
      depositCollateral,
      borrowUsdc,
      withdrawCollateral,
      setAutoRepay,
      simulateGrowth,
      simulateYield,
      pushAlert,
      dismissAlert,
      updateHoldingPrices,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
