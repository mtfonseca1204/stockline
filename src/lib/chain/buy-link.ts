import baseAssets from "../../../contracts/config/base-fork.json";

export function stockBuyLink(ticker: string): string | null {
  const asset = baseAssets.markets.find((market) => market.ticker === ticker);
  if (!asset) return null;
  const params = new URLSearchParams({
    chain: "base",
    inputCurrency: baseAssets.usdc,
    outputCurrency: asset.token,
  });
  return `https://app.uniswap.org/swap?${params}`;
}
