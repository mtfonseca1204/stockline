import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { anvil, base } from "wagmi/chains";
import { createPublicClient } from "viem";
import type { Deployment } from "./types";
import local from "./generated/local.json";
import mainnet from "./generated/base.json";
export const localEnabled = process.env.NEXT_PUBLIC_CHAIN_ID === "31337";
export const networkName = localEnabled ? "Anvil" : "Base";
export const environmentLabel = localEnabled
  ? "Mock demo · Simulated tokens, prices and swaps"
  : "Base mainnet · NVDAc pilot · Real funds";
export const deployment: Deployment = localEnabled
  ? ({
      ...local,
      markets: local.markets.map((m) => ({
        ...m,
        enabled: m.enabled && m.ticker === "NVDAc",
      })),
    } as Deployment)
  : (mainnet as Deployment);
const localRpc =
  process.env.NEXT_PUBLIC_ANVIL_RPC_URL ?? "http://127.0.0.1:8545";
const baseRpc =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ?? "https://mainnet.base.org";
export const config = createConfig({
  chains: [anvil, base],
  connectors: [injected()],
  ssr: true,
  transports: { [anvil.id]: http(localRpc), [base.id]: http(baseRpc) },
});
export const publicClient = createPublicClient({
  chain: localEnabled ? anvil : base,
  transport: http(localEnabled ? localRpc : baseRpc),
});
