import { test } from "node:test";
import assert from "node:assert/strict";
import { inputLimit, percentageAmount } from "./input-limits";
import type { MarketPosition } from "./types";
const position = {
  walletCollateral: 1000n,
  walletUsdc: 300n,
  market: { lltv: "800000000000000000" },
  snapshot: {
    collateralRaw: 1000n,
    debtAssetsRaw: 400n,
    borrowShares: 400n,
    oracleValid: true,
    price: 10n ** 36n,
    availableBorrowRaw: 100n,
  },
} as MarketPosition;
test("presets use correct balances and round down without Number conversion", () => {
  assert.equal(inputLimit("deposit", false, position), 1000n);
  assert.equal(inputLimit("borrow", false, position), 100n);
  assert.equal(inputLimit("repay", false, position), 300n);
  assert.equal(inputLimit("repay", true, position), 1000n);
  assert.equal(inputLimit("withdraw", false, position), 500n);
  for (const pct of [25, 50, 75, 100] as const)
    assert.equal(
      percentageAmount(9007199254740993123n, pct),
      (9007199254740993123n * BigInt(pct)) / 100n,
    );
  assert.equal(percentageAmount(3n, 25), 0n);
});
test("unknown and invalid prices do not create spendable balances", () => {
  assert.equal(inputLimit("deposit", false), null);
  const p = {
    ...position,
    snapshot: { ...position.snapshot!, oracleValid: false },
  };
  assert.equal(inputLimit("withdraw", false, p), null);
  assert.equal(inputLimit("borrow", false, p), null);
  assert.equal(
    inputLimit("withdraw", false, {
      ...p,
      snapshot: { ...p.snapshot, borrowShares: 0n },
    }),
    1000n,
  );
  assert.equal(
    inputLimit("repay", false, { ...position, walletUsdc: null }),
    null,
  );
  assert.equal(
    inputLimit("repay", false, { ...position, walletUsdc: 1000n }),
    400n,
  );
});
test("withdrawal rounds required collateral up and clamps unhealthy positions", () => {
  assert.equal(
    inputLimit("withdraw", false, {
      ...position,
      snapshot: { ...position.snapshot!, debtAssetsRaw: 401n },
    }),
    498n,
  );
  assert.equal(
    inputLimit("withdraw", false, {
      ...position,
      snapshot: { ...position.snapshot!, debtAssetsRaw: 900n },
    }),
    0n,
  );
});
