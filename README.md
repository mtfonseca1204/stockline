# Stockline

Keep your stocks. Access liquidity. Let your assets help repay the loan.

## Apps

| Path | Stack |
|------|--------|
| `/` (root) | Web — Next.js (primary UX) |
| `stockline-native/` | Native — Expo |

## Web UX (redesign)

Four destinations only: **Home · Portfolio · Borrow · Activity**

Calm light UI, progressive disclosure, Aave-inspired lending clarity with Stockline’s own identity. Technical metrics (LTV, liquidation, etc.) stay behind “Details”.

### Demo

1. Enter demo mode (portfolio loaded, **no debt**)
2. Borrow ~$4,000
3. Use demo bar **+$100 → repay**
4. Watch debt drop ($4,000 → $3,900)

## Run

```bash
npm install
npm run dev
```

Native: `cd stockline-native && npm install && npm start`
