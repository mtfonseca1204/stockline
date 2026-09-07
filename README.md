# Kora

Deposit tokenized stocks. Borrow USDC. Keep exposure while borrowing. Sell part of the collateral to reduce debt.

## Core loop

1. Add collateral  
2. Borrow USDC (up to 50% of collateral)  
3. Stocks appreciate  
4. Sell part of the appreciated collateral to repay in USDC

## Run

```bash
npm install
npm run dev
```

Web app uses Base-inspired blue accents with the Kora lime logo mark preserved.

## Onchain local environment

The web now connects to a wallet and reads Morpho positions. Start the Foundry/Anvil environment with the instructions in [contracts/README.md](contracts/README.md). The default build targets the deployed NVDAc pilot on Base mainnet. See [production handoff](contracts/PILOT.md) before publishing. Use `npm run dev:local` explicitly for the mock environment.
