import { test } from "node:test";
import assert from "node:assert/strict";
import { stockBuyLink } from "./buy-link";
import assets from "../../../contracts/config/base-fork.json";
test("buy links select the real Base token and USDC for every supported stock", () => {
  for (const asset of assets.markets) {
    const url = new URL(stockBuyLink(asset.ticker)!);
    assert.equal(url.origin, "https://app.uniswap.org");
    assert.equal(url.searchParams.get("chain"), "base");
    assert.equal(url.searchParams.get("inputCurrency"), assets.usdc);
    assert.equal(url.searchParams.get("outputCurrency"), asset.token);
  }
  assert.equal(stockBuyLink("UNKNOWN"), null);
});
