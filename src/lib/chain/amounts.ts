import { formatUnits, parseUnits } from "viem";
export function parseAmount(text: string, decimals: number): bigint {
  if (
    !/^\d+(\.\d+)?$/.test(text) ||
    (text.split(".")[1]?.length ?? 0) > decimals
  )
    throw new Error(
      `Enter a positive amount with at most ${decimals} decimals.`,
    );
  const raw = parseUnits(text, decimals);
  if (raw <= 0n) throw new Error("Amount must be positive.");
  return raw;
}
export function display(raw: bigint | null | undefined, decimals = 6) {
  return raw == null ? "Unavailable" : formatUnits(raw, decimals);
}
export function marketParams(m: import("./types").MarketConfig) {
  return {
    loanToken: m.loanToken,
    collateralToken: m.collateralToken,
    oracle: m.oracle,
    irm: m.irm,
    lltv: BigInt(m.lltv),
  };
}
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message.split("\n")[0]
    : "The operation failed.";
}
