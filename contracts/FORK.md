> Historical implementation notes. The current deployed pilot status and publishing instructions are in [PILOT.md](PILOT.md). Statements below about missing deployment or blocked release describe earlier checkpoints.

# Base fork integration

The mock demo on 8545 is not a production rehearsal. Integration tests now run separately on a native Base fork on 8546. Both use chain ID 31337; do not point the web's mock deployment manifest at the fork RPC. The fork is not yet connected to the web because the real credit-market oracle/session gate is unresolved.

## Start

The runtime must be Base's patched Anvil. Standard Anvil does not execute the B20 native tokens correctly. The locally verified binary is `.tools/base-anvil/anvil`, ignored by Git. Do not replace global Foundry.

```sh
npm ci
npm run contracts:install
cd contracts
forge build
cd ..
BASE_ANVIL="$PWD/.tools/base-anvil/anvil" \
DYLD_LIBRARY_PATH=/Users/bruno/.local/opt/libusb/lib \
BASE_RPC_URL=https://mainnet.base.org npm run fork:start
```

In a second terminal:

```sh
npm run test:fork
npm run test:release
```

The last command MUST fail until the outstanding release checks have passed. There is no fallback to mocks on RPC errors, missing data or unsupported precompiles.

For another machine, install/build the native binary from `base/base-anvil` at commit `98e7839c65f64aee9627b69a9b98b79afaeb1fae`. The start script checks the commit. The macOS arm64 binary used here reports `1.6.0-nightly` and SHA-256 `9526d1d4be53c2b0d5d48ae9f08e70322c6a3a4f0f54ef05c6e5c47410d9bd24`. It needs libusb; the DYLD path above is this machine's installation, not a portable requirement.

The fork block and hash are fixed in `config/base-fork.json`. The runner checks them plus native Base mode before sending anything. Its transaction client is fixed to loopback port 8546. It does not accept a production signing key or a remote transaction endpoint. Restart the fork for a clean state. Repeated runs on the same node change pool reserves through actual trades.

The publicnode endpoint refused the pinned historical state with “Archive requests require a personal token.” The official Base endpoint worked in this run. A reproducible environment needs an RPC that retains this block; rate limits or missing archive state are failures, not permission to replace contracts.

## What the suite actually executes

1. Checks that the existing Morpho core has the actual AdaptiveCurveIRM and 77% LLTV enabled. It does not enable a fabricated risk parameter. The previous mock 80% is not used.
2. Wraps local account ETH through the existing WETH contract.
3. Buys USDC through the existing Uniswap router and pool. No USDC mint or whale impersonation.
4. Reads each stock's real metadata, feed round and Coinbase registry multiplier/pause state. Also reads the existing USDC/USD and sequencer feeds.
5. Buys 100 USDC of each B20 stock through the real direct pool, transfers to another wallet and back, then sells through the actual StocklineV3Swap bytecode and existing router.
6. Sends an impossible-minimum sale and checks its reverted receipt and unchanged stock/USDC balances.
7. Checks actual output against the quote minimum, stock balance restoration and router allowance cleanup.

Only account ETH is synthetic. No token mint, impersonation, activation of issuer features, `setCode`, storage override, artificial pool liquidity or oracle update is used. Custom Stockline swap code is deployed only in the fork. All upstream contracts retain their original state and code apart from changes made by normal test transactions.

`deployments/base-fork-evidence.json` records the fork identity, custom bytecode hash, addresses, oracle rounds, trade amounts and successful/reverted transaction hashes. The test exits nonzero when a covered transfer or settlement fails. Passing this suite means those paths passed, not that the loan lifecycle passed.

## Outstanding production differences

- At block 51007111, the four equity prices were roughly three days old. The test does not update them or stretch their validity to make a borrow succeed. The one-hour comparison is a conservative diagnostic threshold, not an approved production heartbeat.
- `latestRoundData` does not provide an independently verified open-session status. A real registry read is now exercised, but a registry pause flag alone does not resolve the required closed-session policy. No fake `TestStatus` is deployed by this suite.
- Full real-dependency Morpho supply/borrow/accrual/repay, repayment callback with sale, and liquidation remain blocked on that oracle integration. These paths still have mock-based unit coverage only. The new release command explicitly rejects this evidence as insufficient.
- Fork execution does not establish future liquidity, future issuer policy, legal eligibility, production RPC reliability, continuous oracle updates or safe liquidations during oracle downtime.
- No frontend switch, mainnet deployment or push was performed. The existing web is still the explicitly separate mock demo.

## References

- Native B20 execution: https://github.com/base/base-std/blob/main/LIVE_PRECOMPILE_TESTING.md
- Coinbase feeds and session behavior: https://docs.chain.link/data-feeds/tokenized-equity-feeds/coinbase
- Verified registry ABI/source: https://basescan.org/address/0x3f3E8cf41cdd3b1D118c16471aB0113DfDDd5CaD#code
- Feed directory: https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-base-1.json
- Uniswap addresses: https://docs.uniswap.org/contracts/v3/reference/deployments/base-deployments
