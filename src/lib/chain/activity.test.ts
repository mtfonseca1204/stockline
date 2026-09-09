import { test } from "node:test";
import assert from "node:assert/strict";
import { activityAsset, activityExplorerUrl, activityLabel } from "./activity";
import type { MarketConfig } from "./types";
const market = { ticker: "NVDAc", collateralDecimals: 8, loanDecimals: 6 } as MarketConfig;

test("history uses readable labels and the event's asset units", () => {
  for (const [event, label, asset, decimals, amount] of [
    ["SupplyCollateral", "Collateral added", "NVDAc", 8, 12n],
    ["WithdrawCollateral", "Collateral withdrawn", "NVDAc", 8, 12n],
    ["Borrow", "USDC borrowed", "USDC", 6, 12n],
    ["Repay", "USDC repaid", "USDC", 6, 12n],
    ["RepayWithCollateral", "USDC repaid with collateral", "USDC", 6, 9n],
  ] as const) {
    assert.equal(activityLabel(event), label);
    assert.deepEqual(activityAsset(event, { assets: 12n, repaidAssets: 9n }, market), { asset, amountDecimals: decimals, amount });
  }
});

test("missing and unknown history never invent amounts or token identities", () => {
  assert.equal(activityAsset("Borrow", {}, market).amount, undefined);
  assert.equal(activityAsset("Borrow", { assets: 0n }, market).amount, 0n);
  assert.deepEqual(activityAsset("FutureEvent", { assets: 12n }, market), {});
  for (const name of ["FutureEvent", "", "toString"]) assert.equal(activityLabel(name), "Account activity");
});

test("explorer links require the event chain and a valid transaction hash", () => {
  const hash = `0x${"a".repeat(64)}`;
  assert.equal(activityExplorerUrl(8453, hash), `https://basescan.org/tx/${hash}`);
  for (const chain of [undefined, 1, 31337]) assert.equal(activityExplorerUrl(chain, hash), null);
  for (const invalid of ["0xabc", `${hash}/?url=evil`, "javascript:alert(1)"]) assert.equal(activityExplorerUrl(8453, invalid), null);
});
