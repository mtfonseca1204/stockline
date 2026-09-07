import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount, display, referenceUsd, inputDisplay } from "./amounts";
test("raw amounts preserve fractions beyond Number precision", () => {
  assert.equal(
    parseAmount("9007199254740993.123456", 6),
    9007199254740993123456n,
  );
  assert.equal(parseAmount("0.00000001", 8), 1n);
  assert.equal(display(123456789n, 8), "1.234");
});
test("rejects zero, negative, exponent, excess decimals and ambiguous input", () => {
  for (const s of ["0", "-1", "1e6", "1.0000001", "NaN", "1,5", "", ".5"])
    assert.throws(() => parseAmount(s, 6));
});
test("unknown balances are distinct from zero", () => {
  assert.equal(display(null), "Unavailable");
  assert.equal(display(0n), "0");
});

test("display precision does not round balances up or hide dust", () => {
  assert.equal(display(1234567n, 6), "1.23");
  assert.equal(display(199999999n, 8), "1.999");
  assert.equal(display(1n, 8), "<0.001");
  assert.equal(display(1n, 6), "<0.01");
  assert.equal(display(9007199254740993123456n, 6), "9007199254740993.12");
  assert.equal(inputDisplay("1.23456789", 3), "1.234");
});
test("stock USD reference uses feed and token decimals without a multiplier", () => {
  assert.equal(
    referenceUsd(123456789n, 8, { answer: 20000000000n, decimals: 8 }),
    246913578n,
  );
  assert.equal(referenceUsd(1n, 8, null), null);
  assert.equal(referenceUsd(null, 8, { answer: 1n, decimals: 8 }), null);
});
