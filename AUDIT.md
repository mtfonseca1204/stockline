# Audit notes (Stockline)

## Summary
Prototype credit UX for tokenized stocks on Base. Web (Next.js) is the primary redesigned product; native Expo app remains a parallel prototype.

## Web redesign (current)
- Four destinations only: Home · Portfolio · Borrow · Activity
- Light, calm fintech UI with progressive disclosure
- Onboarding teaches the product without DeFi jargon
- LTV / liquidation / rates behind Details expandables
- Demo: stocks first (no debt) → borrow → +$100 auto-applied → debt drops

## Remaining (prototype)
- Wallet connect is simulated (no real chain calls)
- No real oracles / liquidations / signatures
- Secrets: ensure `.env*` stays gitignored
- Native app not yet aligned to this IA

## Security posture
Safe for demo/hackathon. Not production-ready for real funds.
