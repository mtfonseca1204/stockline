> Historical implementation notes. The current deployed pilot status and publishing instructions are in [PILOT.md](PILOT.md). Statements below about missing deployment or blocked release describe earlier checkpoints.

# Verification record

Date: 2026-09-07. Repository base: `8718bed1c02eed781047242d60f952734385d389`. Changes are uncommitted. No production transaction, commit, push or Vercel deployment was made.

## Passing checks

| Command or check | Result |
| --- | --- |
| `npm run contracts:test` | 22 passed, 0 failed. Includes 256 fuzz cases and 64 invariant runs with 2,048 calls and 0 reverts. |
| `npm run contracts:deploy:local` | 47 successful receipts on chain 31337. Four markets, lending liquidity, funded mock swap and frontend manifest. |
| `npm test` | 5 TypeScript tests passed: raw precision, invalid amounts, unknown balances, pending-operation identity and rejection classification. |
| `npm run test:e2e` | 5 passed in 57.8 seconds. Four complete browser flows and rejection/account/network switching. Transactions use unlocked Anvil accounts, not fabricated receipts. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with 5 existing unused-prop warnings in `src/components/ui/Button.tsx`. |
| `npm run build` | Passed. Next.js production build and prerender completed. |
| `git diff --check` | Passed after removing a changed trailing space. |
| Native local smoke | 29 confirmed transactions; final debt shares and collateral are zero; native B20 balance reflects the two tokens sold. |
| Local source hashes | Exported hashes match the deployed Stockline source files; all 47 deployment receipts have status 1. |

The browser tests cover deposit and approval, borrow, authorization, collateral sale, repayment by shares, withdrawal, reload and grouped activity. The last test rejects a signature and switches account/network, confirming that no success is fabricated and the old review cannot be submitted. The test wallet exists only in the Playwright initialization script and forwards requests to loopback Anvil. It is not shipped in the app.

Browser verification found and fixed a bottom-navigation overlap, gas underestimation during interest accrual, and cached block-number reads immediately after confirmation. Final browser flows passed after those fixes.

## B20 reference and native evidence

Ordinary Forge executes `B20Compatibility.t.sol` with the official pinned `base-std` Solidity reference. This is explicitly logged as reference mode.

Two direct Forge native attempts failed: stable v1.1.1 and nightly `98e7839c65f64aee9627b69a9b98b79afaeb1fae` did not provide the expected Forge precompile dispatch. Forcing native mode on a fork failed at the factory. Those failures have not been relabeled as passes.

The alternate native test succeeded by submitting transactions directly to the nightly Base Anvil node:

```sh
DYLD_LIBRARY_PATH=/Users/bruno/.local/opt/libusb/lib \
  /tmp/stockline-base-nightly/anvil --base --silent --port 8548
npx tsx scripts/native-b20-smoke.mts
```

It activates or verifies the native features, creates a B20 via the native factory, deploys the unmodified Morpho and IRM artifacts, supplies liquidity, deposits the native token, borrows, executes the repayment adapter, repays remaining shares and withdraws all collateral. No `vm.etch` or Solidity token replacement is used. The oracle/session and funded exchange are still mocks. The result and transaction hashes are in `deployments/native-b20-smoke.json`.

This validates the local native-token execution path. It does not validate the issuer-specific permissions, seizure behavior or swap liquidity of the four real Coinbase assets.

## Read-only Base evidence

`BASE_RPC_URL=https://base-rpc.publicnode.com npm run preflight:base` completed at block **51007111**. All four tokens returned the expected symbols, eight decimals, marker `0xef` and positive feed answers. The configured AdaptiveCurveIRM was enabled. **LLTV 80% was not enabled.** Feed answers came from older timestamps; positive values alone do not establish current session validity.

`npx tsx scripts/probe-swaps.mts` queried the official Uniswap V3 factory and QuoterV2 for direct USDC pools. Positive one-token quotes were found for all four assets. NVDAc, AAPLc and METAc had a positive 0.3% route; MSFTc had a positive 1% route. Exact blocks, pools, amounts and failed fee-tier probes are in `deployments/8453.swap-probe.json`. This bounded probe does not cover other venues or multihop routes. No token transfers or mainnet liquidations were executed.

The public Base RPC initially rate-limited calls. A later complete snapshot was collected using PublicNode. The report preserves the block hash and timestamp rather than claiming that an older result is permanently current.

## Remaining release dependencies

- Production registry/session guard and feed-specific recovery/age policy. The local mutable `TestStatus` must never back real collateral.
- Issuer transfer, pause and seizure policy validation across every custody/execution address.
- A reviewed, enabled mainnet LLTV and new market identity. Do not use the demo's 80% setting.
- Full production-router transfer and liquidation tests with the real assets. The prepared V3 integration has unit tests and positive quote discovery, not mainnet settlement evidence.
- Security review of custom contracts, deployment signing account, lender address and per-market USDC amounts.
- Complete historical pricing for deposit-reference/PnL reconstruction. The frontend displays these metrics as unavailable.

The local implementation is usable. Mainnet readiness is deliberately false; a private key by itself is insufficient to clear these dependencies.
