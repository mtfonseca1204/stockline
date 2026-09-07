#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../contracts"
: "${BASE_FORGE:?Set BASE_FORGE to a compatible Base Foundry binary}"
REQUIRE_NATIVE_B20=true "$BASE_FORGE" test --match-contract B20CompatibilityTest -vv "$@"
