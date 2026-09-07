> Historical implementation notes. The current deployed pilot status and publishing instructions are in [PILOT.md](PILOT.md). Statements below about missing deployment or blocked release describe earlier checkpoints.

# Stockline contracts

Local P0 and P1 use unmodified Morpho Blue, its AdaptiveCurveIRM, four isolated markets, a guarded oracle and an atomic collateral repayment adapter. Tokens, market-session status and the separately funded swap are explicit local mocks. They are not Coinbase assets.

## Real-dependency integration fork

Use [FORK.md](FORK.md) for integration evidence before any production release. `npm run test:fork` uses native Base Anvil, existing B20 tokens, USDC, Chainlink feeds, Coinbase registry and Uniswap pools at a pinned Base block. It never mints stocks or overrides storage/feeds. `npm run test:release` deliberately fails while real credit/oracle/session validation is missing.

The web demo below still uses mocks. It is for UI and unit development only and must not count as production integration evidence.

## Run the mock demo locally

From the repository root:

```sh
npm ci
npm run contracts:install
npm run contracts:test
anvil --silent --host 127.0.0.1 --port 8545
```

In another terminal:

```sh
npm run contracts:deploy:local
npm run dev:local
```

Open http://localhost:3005. Connect a browser wallet to chain 31337 and the local RPC. Use an Anvil test account only. The first account deploys; the second has test stocks and 1,000 tUSDC; the third owns the lender shares. Each market starts with 100,000 tUSDC of liquidity. The swap has separate tUSDC reserves. Never reuse these accounts for real assets.

The deployment script refuses any chain other than 31337. It does not reset an existing node. Restart a disposable Anvil node for a clean demonstration, then rerun the deployment script. All mock prices expire after two days; restart/redeploy for a new demo rather than using old prices.

```sh
npm test
npm run typecheck
npm run lint
npm run build
# With the local node and npm run dev:local running:
npm run test:e2e
```

Dependencies are pinned in `dependencies.lock.json`. Solidity 0.8.19 compiles upstream Morpho and IRM without edits, 0.8.28 compiles Stockline, and 0.8.30 compiles the official B20 reference tests. The EVM target is Paris. Tests instantiate the upstream compiled bytecode.

## Positions and permissions

Ordinary actions call Morpho directly with the user's wallet as `onBehalf`. Markets do not share collateral or liquidity. The local LLTV is 80%; the suggested UI limit is 50%. **80% was not enabled on the checked Base deployment. Do not copy this local parameter to mainnet.**

`StocklineLens` uses Morpho's expected-balance and shares libraries. Reads include the block and timestamp. Values are integers, debt rounds up, and collateral value rounds down. An invalid price leaves credit at zero and the oracle status invalid without hiding the existing debt.

`StocklineRepayAdapter` reduces debt through the Morpho repayment callback, withdraws only the specified collateral, sells it, and settles with received USDC. Failure rolls back every step. The callback is bound to the operation hash, user, nonce and phase. Swap output is measured by balance delta. Donations cannot fund a deficient sale, and refunds belong to the initiating user. No owner can change markets, swap, or core. There is no recovery or upgrade function.

Morpho authorization covers all of a user's positions. The frontend exposes authorization and revocation separately. ERC-20 allowance is a different permission. No authorization is requested for basic deposit, borrow, direct repayment or withdrawal.

`TestSwap` is the local funded exchange. `StocklineV3Swap` implements direct Uniswap V3 swaps with fixed router, quoter, factory, token and fee tiers. It rejects all user-provided route data, checks balance deltas and clears allowances. Unit tests exercise router arguments, atomic failure and donation isolation. Positive mainnet QuoterV2 responses for the four assets are recorded in `deployments/8453.swap-probe.json`; real transfer and liquidation validation is still required before deploying that integration.

## Oracle policy

The oracle validates positive prices, timestamps, feed age, sequencer state and recovery grace, and requires `IMarketStatus.isValid(token)`. The latter is the integration point for registry pause and a verified session source. `TestStatus` is only a local controllable mock; it must never be used for real collateral.

Token feeds already include the equity multiplier. Stockline does not multiply again. USDC/USD is also checked. Failing closed can block liquidations as well as borrowing. Direct repayment and adding collateral remain possible. Debt-free collateral withdrawal does not depend on price.

## Mainnet preparation

```sh
# Read-only, no key needed. Use a suitable RPC when the public endpoint rate-limits.
BASE_RPC_URL=https://base-rpc.publicnode.com npm run preflight:base
```

`deployments/8453.preflight.json` contains dated read-only evidence for all four assets. This is not a deployment manifest. None of the four mainnet markets is enabled in the frontend.

Before a mainnet implementation can be released:

1. Validate issuer pause/transfer policies for user, Morpho, adapter, router and liquidator; evaluate administrative seizure behavior.
2. Bind and test registry/session/sequencer sources and per-feed heartbeat/recovery limits. The current feed reads do not establish a valid trading session.
3. Select an actually enabled LLTV and verify the resulting market identity. The local 80% setting is not enabled on the checked mainnet core.
4. Verify executable stock-to-USDC liquidity; validate the prepared fixed production swap integration and demonstrate liquidation with that collateral.
5. Complete native B20 tests with a compatible Base Foundry runtime and review the custom contracts.
6. Specify the lender address and USDC amount for each market; deploy and seed only after all preceding checks pass.

`MarketOperations.s.sol` separates creation and seed actions, checks chain, market ID and enabled parameters, and currently refuses mainnet. This is deliberate while these release dependencies remain unresolved. A private key alone cannot resolve them.

When deployment is ready, import the deployer into an encrypted Foundry keystore with `cast wallet import stockline-deployer --interactive` and use `forge script ... --account stockline-deployer`. Never place a production private key in an environment file, frontend or Git. No mainnet deployment, approval, seed, commit, push or Vercel publish has been performed.

## Native B20 testing

`B20Compatibility.t.sol` uses the pinned official `base-std` factory, token and policy implementation. Under ordinary Forge this is reference mode, not native validation.

```sh
BASE_FORGE=/path/to/base-forge scripts/test-native-b20.sh
```

The script requires native mode, so it cannot silently report a reference run as native success. Both the stable v1.1.1 binary and nightly 98e7839c tested here lacked the required Forge dispatch; a manual fork attempt failed at the B20 factory. A separate direct-RPC smoke then passed 29 transactions on native base-anvil, including B20 creation, Morpho supply/borrow, adapter sale, repayment by shares and full withdrawal. It does not use Solidity etching. This proves the local native token path, not the policies or liquidity of the four Coinbase assets. Existing Foundry executables were not replaced.

Run a compatible `base-anvil --base --silent --port 8548`, then `npx tsx scripts/native-b20-smoke.mts` from the repository root. This script creates test assets and sends transactions only to the fixed loopback endpoint. It records results in `deployments/native-b20-smoke.json`.

## Frontend limits and recovery

The web uses integer token quantities, actual wallet signatures and successful receipts. Rejected signatures and failed transactions never update balances as confirmed. Network/account changes invalidate reviews. A hash is persisted while pending. Reloading does not automatically submit another operation. An unknown submission outcome must be reconciled in the wallet before retrying.

History reads and groups canonical core/adapter events, paginates requests, and re-reads up to 50,000 blocks to reconcile reorgs. Current position state always comes from RPC. Historical pricing is not verified, so PnL and deposit reference are explicitly unavailable. Auto-repay and the native app remain outside this implementation.
