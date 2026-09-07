import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount, display } from "./amounts";
test("raw amounts preserve fractions beyond Number precision", () => {
  assert.equal(
    parseAmount("9007199254740993.123456", 6),
    9007199254740993123456n,
  );
  assert.equal(parseAmount("0.00000001", 8), 1n);
  assert.equal(display(123456789n, 8), "1.23456789");
});
test("rejects zero, negative, exponent, excess decimals and ambiguous input", () => {
  for (const s of ["0", "-1", "1e6", "1.0000001", "NaN", "1,5", "", ".5"])
    assert.throws(() => parseAmount(s, 6));
});
test("unknown balances are distinct from zero", () => {
  assert.equal(display(null), "Unavailable");
  assert.equal(display(0n), "0");
});
