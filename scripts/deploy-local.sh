#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export DEPLOYER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
(cd contracts && forge script script/DeployLocal.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --unlocked --sender "$DEPLOYER")
node scripts/export-contracts.mjs
