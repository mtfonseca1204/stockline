# Stockline

Self-repaying credit for tokenized stocks on Base.

## Apps

| Path | Stack |
|------|--------|
| `/` (root) | Web — Next.js |
| `stockline-native/` | Native — Expo / React Native |

Shared: dark **glass** UI, lime `#B8F000`, Archivo Black + Space Grotesk, animated noise, confirm popups for actions.

## Native Follow-up
Home dashboard includes a **Follow-up** panel:
- Debt payoff progress
- Live feed of completed actions (borrow, deposit, yield…)
- Highlight when something just completed

## Run

```bash
# Web
npm install
npm run dev

# Native
cd stockline-native
npm install
npm start
```

## Demo
Landing → **Enter Demo Mode** → use **+$100 yield** / **+10%** and watch Follow-up update.
