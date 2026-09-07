# Base NVDAc pilot handoff

The Base pilot is deployed. Eight successful transaction receipts, contract addresses, market parameters and artifact hashes are recorded in `deployments/8453.json`. The market was seeded with 98 USDC. Other stocks remain Coming soon.

## Frontend deployment

Use the repository root, Node.js 22, `npm ci`, `npm run build`, and the Next.js preset in Vercel. Set `NEXT_PUBLIC_CHAIN_ID=8453` before building. Remove any old value of 31337. Optionally set `NEXT_PUBLIC_BASE_RPC_URL` to a browser-accessible Base RPC; the default is https://mainnet.base.org. Public environment variables must never contain secrets. No private key is needed to build or host the frontend.

`npm run dev:mainnet` serves the real-funds pilot on port 3005. `npm run dev:local` explicitly selects the mock environment. The native application is outside this delivery. Vercel publication is left to the project owner.

## Evidence and limitations

- `npm test`: 9 tests passed.
- `npm run contracts:test`: 25 tests passed, including 256 fuzz runs and 64 invariant runs with 2048 calls.
- `npm run lint`: zero errors, five existing unused-handler warnings in Button.tsx.
- `npm run build` and `npm run typecheck`: passed.
- The earlier mock frontend E2E run passed four tests.
- `deployments/pilot-credit-evidence.json` records 30 successful transactions on native Base Anvil at block 50877884 using existing assets, feeds, pools and Morpho, including interest, collateral sale repayment and liquidation.
- Mainnet deployment and supply are confirmed; a complete real mainnet borrowing cycle has not been executed.
- `scripts/check-pilot-ui.mts` is an unfinished read-only browser verification. Its last run failed during injected wallet connection with Provider not found. Do not describe production wallet UI verification as passed. After publication verify a real browser wallet, chain switching, balances, collateral link and transaction receipts before broad use.
- Explorer source verification and an independent security audit have not been completed.

## Session policy

The administrator can pause the immutable Nasdaq session guard. Calendar coverage ends on 2026-12-31. Borrowing and liquidation require an open configured regular session, a current-session price, valid registry and sequencer checks. Closed sessions and unavailable prices block liquidation too. September 7 is a configured holiday. No feed timestamps are fabricated to enable borrowing.

The market LLTV is 77%; the UI suggests at most 50%. These are different limits. The pilot designation does not imply production security certification.

Do not rerun the broadcast script: deployment is complete. Keep signing material outside Git and the frontend. Deployment receipts and artifacts contain public data only.
