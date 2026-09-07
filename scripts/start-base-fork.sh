#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${BASE_ANVIL:?Set BASE_ANVIL to the pinned native Base anvil binary. Ordinary Anvil cannot execute B20.}"
EXPECTED_COMMIT="$(node -p "require('./contracts/config/base-fork.json').baseAnvilCommit")"
if ! "$BASE_ANVIL" --version | grep -Fq "$EXPECTED_COMMIT"; then
  echo "Base Anvil does not match pinned commit $EXPECTED_COMMIT" >&2
  exit 1
fi
BASE_FORK_UPSTREAM="${BASE_RPC_URL:-https://mainnet.base.org}"
FORK_BLOCK="$(node -p "require('./contracts/config/base-fork.json').forkBlockNumber")"
# Fixed loopback and independent port: preserves the existing mock chain on 8545.
# No private keys, auto-impersonation, storage overrides or feature activation.
exec "$BASE_ANVIL" --base --fork-url "$BASE_FORK_UPSTREAM" --fork-block-number "$FORK_BLOCK" --chain-id 31337 --accounts 3 --host 127.0.0.1 --port 8546 --silent
