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
  BORROW_RATIO,
  formatUsd,
  portfolioValue,
  unrealizedGains,
} from "@/lib/calculations";
import { WALLET_ASSETS } from "@/lib/mock-data";
import type {
  AlertItem,
  AlertTone,
  AppState,
  AppView,
  Holding,
  WalletAsset,
  WalletProvider,
} from "@/lib/types";

interface AppContextValue extends AppState {
  collateral: number;
  debt: number;
  available: number;
  gains: number;
  connectWallet: (provider: WalletProvider) => void;
  disconnectWallet: () => void;
  setView: (view: AppView) => void;
  goBack: () => void;
  openStock: (ticker: string) => void;
  /** Quiet start — connected empty account (no demo chrome) */
  startApp: () => void;
  depositCollateral: (ticker: string, amount: number) => void;
  borrowUsdc: (amount: number) => void;
  repayFromGains: (amount: number) => void;
  simulateAppreciation: (amount?: number) => void;
  pushAlert: (tone: AlertTone, title: string, message: string) => void;
  dismissAlert: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialCredit = {
  debt: 0,
  originalDebt: 0,
  maxLtv: BORROW_RATIO,
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

function cloneWallet(): WalletAsset[] {
  return WALLET_ASSETS.map((a) => ({ ...a }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(
    null
  );
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [walletAssets, setWalletAssets] = useState<WalletAsset[]>(cloneWallet);
  const [credit, setCredit] = useState(initialCredit);
  const [activities, setActivities] = useState<AppState["activities"]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [view, setViewState] = useState<AppView>("landing");
  const [previousView, setPreviousView] = useState<AppView>("landing");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const collateral = portfolioValue(holdings);
  const debt = credit.debt;
  const available = availableCredit(collateral, debt, credit.maxLtv);
  const gains = unrealizedGains(holdings);

  const pushAlert = useCallback(
    (tone: AlertTone, title: string, message: string) => {
      setAlerts((prev) => [makeAlert(tone, title, message), ...prev].slice(0, 2));
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
    setViewState(previousView === view ? "home" : previousView);
  }, [previousView, view]);

  const openStock = useCallback(
    (ticker: string) => {
      setSelectedTicker(ticker);
      setView("stock");
    },
    [setView]
  );

  const enterApp = useCallback((provider: WalletProvider = "coinbase") => {
    setConnected(true);
    setWalletProvider(provider);
    setWalletAddress("0x7a3F9c2E4b81d0A6fC12e88B");
    setHoldings([]);
    setWalletAssets(cloneWallet());
    setCredit({ ...initialCredit });
    setActivities([]);
    setAlerts([]);
    setViewState("home");
  }, []);

  const connectWallet = useCallback(
    (provider: WalletProvider) => {
      enterApp(provider);
    },
    [enterApp]
  );

  const startApp = useCallback(() => {
    enterApp("coinbase");
  }, [enterApp]);

  const disconnectWallet = useCallback(() => {
    setConnected(false);
    setWalletAddress(null);
    setWalletProvider(null);
    setHoldings([]);
    setWalletAssets(cloneWallet());
    setCredit({ ...initialCredit });
    setActivities([]);
    setViewState("landing");
  }, []);

  const depositCollateral = useCallback(
    (ticker: string, amount: number) => {
      const asset = walletAssets.find((a) => a.ticker === ticker);
      if (!asset || amount <= 0 || amount > asset.available + 0.01) return;

      setWalletAssets((prev) =>
        prev.map((a) =>
          a.ticker === ticker
            ? { ...a, available: Math.max(0, Math.round(a.available - amount)) }
            : a
        )
      );

      setHoldings((prev) => {
        const existing = prev.find((h) => h.ticker === ticker);
        if (existing) {
          return prev.map((h) =>
            h.ticker === ticker
              ? {
                  ...h,
                  value: h.value + amount,
                  costBasis: h.costBasis + amount,
                }
              : h
          );
        }
        return [
          ...prev,
          {
            ticker,
            name: asset.name,
            value: amount,
            costBasis: amount,
          },
        ];
      });

      setActivities((prev) => [
        {
          id: `dep-${Date.now()}`,
          date: "Today",
          label: "Collateral added",
          action: "Deposit",
          asset: ticker,
          amount: `+${formatUsd(amount)} ${ticker}`,
          status: "confirmed",
          detail: `${formatUsd(amount)} ${asset.name} deposited as collateral.`,
        },
        ...prev,
      ]);
    },
    [walletAssets]
  );

  const borrowUsdc = useCallback((amount: number) => {
    setCredit((prev) => ({
      ...prev,
      debt: prev.debt + amount,
      originalDebt: prev.originalDebt === 0 ? amount : prev.originalDebt,
    }));
    setActivities((prev) => [
      {
        id: `bor-${Date.now()}`,
        date: "Today",
        label: "Borrowed",
        action: "Borrow",
        asset: "USDC",
        amount: `+${formatUsd(amount)} USDC`,
        status: "confirmed",
        detail: `${formatUsd(amount)} USDC borrowed against your collateral.`,
      },
      ...prev,
    ]);
  }, []);

  const repayFromGains = useCallback(
    (amount: number) => {
      const apply = Math.min(amount, debt, gains);
      if (apply <= 0) return;

      // Reduce cost basis upward toward current value as gains are "used"
      // and reduce debt. We keep collateral value the same (stocks stay deposited)
      // but lock in gains by raising costBasis so gains decrease.
      setHoldings((prev) => {
        const totalGains = unrealizedGains(prev);
        if (totalGains <= 0) return prev;
        return prev.map((h) => {
          const hGain = Math.max(0, h.value - h.costBasis);
          const share = hGain / totalGains;
          const used = apply * share;
          return { ...h, costBasis: Math.min(h.value, h.costBasis + used) };
        });
      });

      setCredit((prev) => ({
        ...prev,
        debt: Math.max(0, prev.debt - apply),
      }));

      setActivities((prev) => [
        {
          id: `rep-${Date.now()}`,
          date: "Today",
          label: "Loan repayment",
          action: "Repay",
          asset: "USDC",
          amount: `-${formatUsd(apply)} USDC`,
          status: "confirmed",
          detail: `Used ${formatUsd(apply)} of stock gains to reduce your loan.`,
        },
        ...prev,
      ]);
    },
    [debt, gains]
  );

  const simulateAppreciation = useCallback(
    (amount = 200) => {
      if (holdings.length === 0) return;
      // Prefer NVDA, else grow the largest holding
      setHoldings((prev) => {
        const target =
          prev.find((h) => h.ticker === "NVDA") ??
          [...prev].sort((a, b) => b.value - a.value)[0];
        return prev.map((h) =>
          h.ticker === target.ticker
            ? { ...h, value: h.value + amount }
            : h
        );
      });
      setActivities((prev) => [
        {
          id: `apr-${Date.now()}`,
          date: "Today",
          label: "Collateral increased",
          action: "Market",
          asset: "Stocks",
          amount: `+${formatUsd(amount)}`,
          status: "confirmed",
          detail: `Your deposited stocks gained ${formatUsd(amount)} in value.`,
        },
        ...prev,
      ]);
      pushAlert(
        "healthy",
        "Your stocks gained value",
        `Collateral increased by ${formatUsd(amount)}.`
      );
    },
    [holdings.length, pushAlert]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      connected,
      walletAddress,
      walletProvider,
      holdings,
      walletAssets,
      credit,
      activities,
      alerts,
      view,
      previousView,
      selectedTicker,
      collateral,
      debt,
      available,
      gains,
      connectWallet,
      disconnectWallet,
      setView,
      goBack,
      openStock,
      startApp,
      depositCollateral,
      borrowUsdc,
      repayFromGains,
      simulateAppreciation,
      pushAlert,
      dismissAlert,
    }),
    [
      connected,
      walletAddress,
      walletProvider,
      holdings,
      walletAssets,
      credit,
      activities,
      alerts,
      view,
      previousView,
      selectedTicker,
      collateral,
      debt,
      available,
      gains,
      connectWallet,
      disconnectWallet,
      setView,
      goBack,
      openStock,
      startApp,
      depositCollateral,
      borrowUsdc,
      repayFromGains,
      simulateAppreciation,
      pushAlert,
      dismissAlert,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
