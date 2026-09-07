import { test } from "node:test";
import assert from "node:assert/strict";
import { pendingKey, isWalletRejection } from "./pending";
test("pending operations are scoped to chain and owner", () => {
  const a = "0x0000000000000000000000000000000000000001";
  const b = "0x0000000000000000000000000000000000000002";
  assert.notEqual(pendingKey(31337, a), pendingKey(8453, a));
  assert.notEqual(pendingKey(31337, a), pendingKey(31337, b));
});
test("only explicit wallet rejection clears uncertain submissions", () => {
  assert.equal(isWalletRejection({ cause: { code: 4001 } }), true);
  assert.equal(isWalletRejection(new Error("Network failed")), false);
  assert.equal(isWalletRejection({ code: -32603 }), false);
});
