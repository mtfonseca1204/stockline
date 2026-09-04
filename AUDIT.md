# Audit notes (Stockline)

## Summary
Prototype credit UX for tokenized stocks on Base. Web (Next.js) + native (Expo) share one glass/lime design language.

## Findings addressed
- Unified dark glass tokens across web + native
- Confirmation modals for borrow / deposit / withdraw / auto-repay
- Aggressive display type (Archivo Black) + Space Grotesk UI
- Animated noise/grain background
- Native Follow-up dashboard tracks completed actions + debt payoff %

## Remaining (prototype)
- Wallet connect is simulated (no real chain calls)
- No real oracles / liquidations / signatures
- Secrets: ensure `.env*` stays gitignored before any mainnet keys
- Do not commit `node_modules`, `.next`, `.expo`

## Security posture
Safe for demo/hackathon. Not production-ready for real funds.
