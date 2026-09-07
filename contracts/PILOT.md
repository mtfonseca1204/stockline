# Current pilot: 24/7 NVDAc

The current deployment in `deployments/8453.json` is the 24/7 pilot. The former session-restricted deployment is preserved in `deployments/8453-session-pilot.json` and the web legacy manifest.

## Policy

The user approved accepting the last published equity price without an age limit, including weekends and holidays. The equity oracle uses maximum uint256 as its age limit. Stockline still validates positive prices and round timestamps, Coinbase registry pauses, an administrator emergency pause, USDC freshness of 24 hours, and sequencer recovery of one hour. No trading calendar is consulted by the new guard. Therefore 24/7 means no scheduled closure; safety failures and lack of liquidity can still block an operation. Stale stock prices can affect borrowing and liquidation.

LLTV remains 77%, with a 50% suggested UI limit. Morpho, token, IRM and Uniswap deployments are unchanged. New guard, oracle, swap adapter, repayment adapter and lens were deployed. Nine receipts record deployment and migration of the original 98 USDC lender supply.

## Existing positions

No user collateral was moved. The app shows an old-market position separately, permits direct repayment and withdrawal, then the user can deposit into the new market. The old market remains immutable and session-restricted. The old lender supply was withdrawn only after verifying zero debt and the deployer's exact supply shares. Never overwrite the legacy manifest or hide its withdrawal interface while positions exist.

## Verification

- `npm run contracts:test`: 26 tests, including the new old-price/pauses test.
- `scripts/test-always-open.mts`: 30 successful transactions with native Base Anvil at block 50877884, with the full credit cycle executed after regular-session closing. Existing B20 assets, feeds, pools and Morpho; no feed/storage overrides.
- `deployments/always-open-credit-evidence.json`: fork receipts and matching artifact hashes.
- `deployments/8453-always-open-progress.json`: actual Base deployment and liquidity migration receipts.
- `scripts/smoke-always-open-mainnet.mts`: bounded production cycle, 0.10 USDC stock purchase and 0.02 USDC borrow, full repayment and withdrawal. Eight mainnet transactions completed successfully; the borrower position ended with zero debt and zero collateral. Never rerun if progress exists.

- `npm test`: 13 passed. `npm run test:e2e`: 5 passed. Build, TypeScript and lint passed, with five existing lint warnings.
- `scripts/check-always-open-ui.mts`: read-only injected wallet verified the actual Base oracle, old collateral position, purchase link and Coming soon badges in a production build.

## Frontend publication

Publish the repository root as Next.js using Node.js 22, `npm ci`, `npm run build`, and `NEXT_PUBLIC_CHAIN_ID=8453`. Optional public Base RPC configuration must not contain private signing credentials. No key is needed by the frontend. Base view reads are grouped through Multicall to reduce public RPC bursts; a dedicated browser-accessible RPC remains preferable to the public rate-limited endpoint. The legacy warning is shown in all app views for wallets with old positions. Vercel publication remains with the project owner.

No independent audit or explorer source verification has been completed. This is a controlled hackathon pilot.

## Reproduce the native test

Start the pinned Base Anvil binary from FORK.md with `--base --fork-url https://mainnet.base.org --fork-block-number 50877884 --chain-id 31337 --accounts 3 --host 127.0.0.1 --port 8549 --silent`, then run `npx tsx scripts/test-always-open.mts`. Use a fresh disposable node. The test changes that local node's timestamp.
