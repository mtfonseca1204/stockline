import type { Address, Hex } from "viem";
export type PendingOperation = {
  to: Address;
  data: Hex;
  hash?: Hex;
  submittedAt: number;
};
export function pendingKey(chainId: number, owner: Address) {
  return `stockline:pending:${chainId}:${owner.toLowerCase()}`;
}
export function loadPending(key: string): PendingOperation | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  return JSON.parse(value) as PendingOperation;
}
export function savePending(key: string, operation: PendingOperation) {
  localStorage.setItem(key, JSON.stringify(operation));
}
export function clearPending(key: string) {
  localStorage.removeItem(key);
}
export function isWalletRejection(error: unknown): boolean {
  let value = error;
  for (
    let depth = 0;
    depth < 8 && value && typeof value === "object";
    depth++
  ) {
    if ("code" in value && value.code === 4001) return true;
    value = "cause" in value ? value.cause : null;
  }
  return false;
}
