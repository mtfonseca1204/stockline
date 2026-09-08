"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import {
  WagmiProvider,
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { config, deployment } from "@/lib/chain/config";
import { getAccount } from "wagmi/actions";
import { usePathname, useRouter } from "next/navigation";
import { execute, readHistory, readPositions } from "@/lib/chain/service";
import { errorMessage } from "@/lib/chain/amounts";
import type { Action, MarketConfig, Quote, TxState } from "@/lib/chain/types";
import type { AppView, AlertItem } from "@/lib/types";
function useAppState() {
  const account = useAccount();
  const connection = useConnect();
  const disconnect = useDisconnect();
  const switching = useSwitchChain();
  const router = useRouter();
  const pathname = usePathname();
  const [appView, setView] = useState<AppView>("home");
  const view = pathname === "/" ? "landing" : appView;
  const startApp = () => {
    setView("home");
    router.push("/app");
  };
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [tx, setTx] = useState<TxState>({ phase: "idle" });
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const context = `${account.address}:${account.chainId}`;
  const busy = useRef(false);
  const correctNetwork = !!deployment && account.chainId === deployment.chainId;
  const positions = useQuery({
    queryKey: ["positions", context],
    queryFn: () => readPositions(account.address!),
    enabled: !!account.address && correctNetwork,
    refetchInterval: 12000,
  });
  const history = useQuery({
    queryKey: ["history", context],
    queryFn: () => readHistory(account.address!),
    enabled: !!account.address && correctNetwork,
    refetchInterval: 12000,
  });
  const run = async (
    action: Action,
    market: MarketConfig,
    amount = 0n,
    quote?: Quote,
  ) => {
    if (!account.address || !correctNetwork)
      throw new Error("Connect your wallet to the configured network.");
    if (busy.current) throw new Error("Wait for the current operation.");
    busy.current = true;
    const started = context;
    const update = (state: TxState) => {
      const now = getAccount(config);
      if (`${now.address}:${now.chainId}` === started)
        setTx({ ...state, context: started });
    };
    update({ phase: "review" });
    try {
      const hash = await execute(
        action,
        market,
        amount,
        account.address,
        update,
        quote,
      );
      await Promise.all([positions.refetch(), history.refetch()]);
      return hash;
    } catch (e) {
      update({ phase: "failed", message: errorMessage(e) });
      throw e;
    } finally {
      busy.current = false;
    }
  };
  return {
    view,
    setView,
    selectedTicker,
    openStock: (ticker: string) => {
      setSelectedTicker(ticker);
      setView("stock");
    },
    connected: account.isConnected,
    walletAddress: account.address ?? null,
    correctNetwork,
    connectWallet: async (
      connector: (typeof connection.connectors)[number],
    ) => {
      await connection.connectAsync({ connector });
      startApp();
    },
    connectors: connection.connectors,
    connectionError: connection.error,
    disconnectWallet: () => {
      disconnect.disconnect();
      setView("home");
      router.push("/");
    },
    switchNetwork: () =>
      switching.switchChain({ chainId: deployment?.chainId ?? 8453 }),
    startApp,
    positions: positions.data ?? [],
    loading: positions.isLoading,
    error: positions.error,
    history: history.data ?? [],
    historyError: history.error,
    refresh: () => positions.refetch(),
    run,
    tx: tx.context === context ? tx : ({ phase: "idle" } as TxState),
    resetTx: () => setTx({ phase: "idle" }),
    alerts,
    dismissAlert: (id: string) =>
      setAlerts((a) => a.filter((x) => x.id !== id)),
  };
}
const AppContext = createContext<ReturnType<typeof useAppState> | null>(null);
function StateProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}
export function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <StateProvider>{children}</StateProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
export function useApp() {
  const state = useContext(AppContext);
  if (!state) throw new Error("AppProvider missing");
  return state;
}
