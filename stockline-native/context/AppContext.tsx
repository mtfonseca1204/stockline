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
  ActivityItem,
  AlertItem,
  AlertTone,
  ChangeKind,
  ChangeLogEntry,
  CreditState,
  Holding,
  WalletProvider,
} from "@/lib/types";

interface AppContextValue {
  connected: boolean;
  walletAddress: string | null;
  walletProvider: WalletProvider | null;
  demoMode: boolean;
  hasPosition: boolean;
  holdings: Holding[];
  credit: CreditState;
  activities: ActivityItem[];
  alerts: AlertItem[];
  changeLog: ChangeLogEntry[];
  lastCompletedId: string | null;
  collateral: number;
  debt: number;
  available: number;
  currentLtv: number;
  yieldMonthly: number;
  repayMonthly: number;
  payoffMonths: number | null;
  health: ReturnType<typeof portfolioHealth>;
  repaidPct: number;
  connectWallet: (provider: WalletProvider) => void;
  disconnectWallet: () => void;
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
  clearLastCompleted: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialCredit: CreditState = {
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

function makeChange(
  kind: ChangeKind,
  title: string,
  detail: string,
  extras?: Partial<ChangeLogEntry>
): ChangeLogEntry {
  return {
    id: `chg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    title,
    detail,
    completed: true,
    at: Date.now(),
    ...extras,
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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);

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
  const repaidPct =
    credit.originalDebt > 0
      ? Math.min(
          100,
          Math.round(
            ((credit.originalDebt - credit.debt) / credit.originalDebt) * 100
          )
        )
      : 0;

  const pushAlert = useCallback(
    (tone: AlertTone, title: string, message: string) => {
      setAlerts((prev) => [makeAlert(tone, title, message), ...prev].slice(0, 3));
    },
    []
  );

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const pushChange = useCallback((entry: ChangeLogEntry) => {
    setChangeLog((prev) => [entry, ...prev].slice(0, 20));
    setLastCompletedId(entry.id);
  }, []);

  const clearLastCompleted = useCallback(() => {
    setLastCompletedId(null);
  }, []);

  const connectWallet = useCallback(
    (provider: WalletProvider) => {
      setConnected(true);
      setWalletProvider(provider);
      setWalletAddress("0x7a3F9c2E4b81d0A6fC12e88B");
      pushAlert(
        "healthy",
        "Wallet connected",
        "You're on Base. Start by depositing tokenized stocks."
      );
      pushChange(
        makeChange("connect", "Wallet connected", "Ready to supply collateral")
      );
    },
    [pushAlert, pushChange]
  );

  const disconnectWallet = useCallback(() => {
    setConnected(false);
    setWalletAddress(null);
    setWalletProvider(null);
    setDemoMode(false);
    setHasPosition(false);
    setHoldings([]);
    setCredit({ ...initialCredit });
    setActivities([]);
    setChangeLog([]);
    setLastCompletedId(null);
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
    setAlerts([
      makeAlert(
        "healthy",
        "Demo Mode",
        "Pre-loaded portfolio for presentation. Use demo controls to simulate events."
      ),
    ]);
    const entry = makeChange(
      "connect",
      "Demo portfolio loaded",
      "Follow changes as you borrow, earn yield, and repay."
    );
    setChangeLog([entry]);
    setLastCompletedId(entry.id);
  }, []);

  const resetToEmpty = useCallback(() => {
    setDemoMode(false);
    setHoldings([]);
    setHasPosition(false);
    setCredit({ ...initialCredit });
    setActivities([]);
    setChangeLog([]);
    setLastCompletedId(null);
    setConnected(true);
  }, []);

  const depositCollateral = useCallback(
    (selections: Record<string, number>) => {
      const deposited = Object.values(selections).reduce((a, b) => a + b, 0);
      setHoldings((prev) => {
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
        return prev.map((h) => {
          const addValue = selections[h.ticker] ?? 0;
          if (addValue <= 0) return h;
          const addQty = addValue / h.price;
          return {
            ...h,
            quantity: h.quantity + addQty,
            availableToDeposit: Math.max(0, h.availableToDeposit - addQty),
          };
        });
      });
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
      pushChange(
        makeChange(
          "deposit",
          "Deposit complete",
          `${formatUsd(deposited)} collateral supplied`,
          { portfolioDelta: deposited }
        )
      );
    },
    [pushAlert, pushChange]
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
      pushChange(
        makeChange(
          "borrow",
          "Borrow complete",
          `${formatUsd(amount)} USDC unlocked`,
          { debtDelta: amount }
        )
      );
    },
    [pushAlert, pushChange]
  );

  const withdrawCollateral = useCallback(
    (amount: number) => {
      setHoldings((prev) => {
        const total = portfolioValue(prev);
        if (total <= 0) return prev;
        const ratio = amount / total;
        return prev
          .map((h) => ({ ...h, quantity: h.quantity * (1 - ratio) }))
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
      pushChange(
        makeChange(
          "withdraw",
          "Withdraw complete",
          `${formatUsd(amount)} collateral released`,
          { portfolioDelta: -amount }
        )
      );
    },
    [pushAlert, pushChange]
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
      pushChange(
        makeChange(
          "settings",
          enabled ? "Auto-Repay enabled" : "Auto-Repay disabled",
          enabled ? `${percent}% of yield → debt` : "Yield stays available"
        )
      );
    },
    [pushAlert, pushChange]
  );

  const simulateGrowth = useCallback(
    (pct = 0.1) => {
      const before = portfolioValue(holdings);
      setHoldings((prev) =>
        prev.map((h) => ({
          ...h,
          price: Number((h.price * (1 + pct)).toFixed(2)),
          change24h: Number((pct * 100).toFixed(1)),
        }))
      );
      const after = before * (1 + pct);
      pushAlert(
        "healthy",
        "Portfolio growth simulated",
        `Holdings increased by ${(pct * 100).toFixed(0)}%. Available credit and health updated.`
      );
      pushChange(
        makeChange(
          "growth",
          "Portfolio +10%",
          `Value moved ${formatUsd(before)} → ${formatUsd(after)}`,
          { portfolioDelta: after - before }
        )
      );
    },
    [holdings, pushAlert, pushChange]
  );

  const simulateYield = useCallback(
    (amount = 100) => {
      let applied = 0;
      setCredit((prev) => {
        applied = prev.autoRepayEnabled
          ? amount * (prev.autoRepayPercent / 100)
          : 0;
        return { ...prev, debt: Math.max(0, prev.debt - applied) };
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
      pushChange(
        makeChange(
          "yield",
          "Yield applied",
          applied > 0
            ? `${formatUsd(amount)} earned · ${formatUsd(applied)} repaid`
            : `${formatUsd(amount)} earned · auto-repay off`,
          { debtDelta: -applied }
        )
      );
    },
    [pushAlert, pushChange]
  );

  const value = useMemo(
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
      changeLog,
      lastCompletedId,
      collateral,
      debt,
      available,
      currentLtv,
      yieldMonthly,
      repayMonthly,
      payoffMonths,
      health,
      repaidPct,
      connectWallet,
      disconnectWallet,
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
      clearLastCompleted,
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
      changeLog,
      lastCompletedId,
      collateral,
      debt,
      available,
      currentLtv,
      yieldMonthly,
      repayMonthly,
      payoffMonths,
      health,
      repaidPct,
      connectWallet,
      disconnectWallet,
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
      clearLastCompleted,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
