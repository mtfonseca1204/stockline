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
export function display(
  raw: bigint | null | undefined,
  decimals = 6,
  places = decimals === 6 || decimals === 2 ? 2 : 3,
) {
  if (raw == null) return "Unavailable";
  const precision = Math.min(decimals, places);
  const truncated = raw / 10n ** BigInt(decimals - precision);
  if (raw > 0n && truncated === 0n) return `<${formatUnits(1n, precision)}`;
  return formatUnits(truncated, precision);
}
export function referenceUsd(
  raw: bigint | null | undefined,
  tokenDecimals: number,
  price?: { answer: bigint; decimals: number } | null,
) {
  if (raw == null || !price || price.answer <= 0n) return null;
  return (
    (raw * price.answer * 1000000n) /
    10n ** BigInt(tokenDecimals + price.decimals)
  );
}
export function inputDisplay(text: string, places: number) {
  const [whole, fraction] = text.split(".");
  return fraction === undefined
    ? whole
    : `${whole}.${fraction.slice(0, places)}`;
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
