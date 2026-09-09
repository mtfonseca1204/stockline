# Research and evidence notes

Prepared September 9, 2026. These notes are outside the slide stage. Public links are sources, not endorsement claims.

## Challenge and submission

- [Official announcement](https://x.com/buildonbase/status/2095105184120664122) and its organizer replies were verified in Chrome after the web fetch returned 403. The theme is building something that helps people trade or use Coinbase Tokenized Stocks on Base. The organizer specifies $2,000 for the top project and $3,000 across five finalists, selected at Base's discretion. It asks for a Loom demo posted on X tagging @buildonbase and a form submission.
- [Rules post](https://x.com/buildonbase/status/2095105194539298895), expanded in the official thread: 18+, void where prohibited, September 9, 2026 at 11:59pm EST; internal eligibility review, identity verification and tax obligations for winners. Projects enabling US-user trading are outside scope. No weighted judging rubric was published in the material inspected. The EST/EDT wording is not resolved, so no countdown or converted deadline is on the slides. The deck does not promise a win.
- [Official submission form](https://docs.google.com/forms/d/e/1FAIpQLSfru57ZLO9AQ-hgWX_G5ZAzmAKkzFLZCyqe5wTyBSwACFX5tg/viewform): read-only HTML fetch verified the title “Base Builder Quest - Tokenized Stocks” and required project name, short problem statement, public demo video URL, live project URL, Builder Code and submission tweet link. The tweet field asks for a Loom demo on X tagging @buildonbase. No form was filled or submitted. Public form text identifies Coinbase as its creator.

## Product and Base fit

- [Base: Stocks just got updated](https://blog.base.org/tokenized-stocks): establishes Coinbase Tokenized Stocks on Base, B20 composability and eligible non-US scope. The presentation uses that narrow grounding, without repeating market-size, yield or “instant settlement” claims.
- [Base: Request for Builders, Tokenized Stocks](https://blog.base.org/request-for-builders-tokenized-stocks): describes composable equity use cases including credit. This supports the relevance of borrowing against stock collateral. It does not establish Kora as a partner, winner, endorsed app, or a self-repaying product.
- Repository sources inspected: `contracts/PILOT.md`, `src/lib/chain/generated/base.json`, `src/lib/chain/service.ts`, `src/components/screens/TransactionForm.tsx`, `src/components/screens/Portfolio.tsx`, `src/components/screens/Activity.tsx` and `README.md`. The pilot uses Morpho, NVDAc collateral and USDC debt. Suggested UI borrowing limit is 50% versus 77% market LLTV; these are not the same limit. The illustrative slide rounds values and is not a quote. It does not incorporate current liquidity, interest or the UI rounding buffer.
- `contracts/PILOT.md` says no scheduled closure, but documents stale equity prices, safety checks, liquidity constraints and no independent audit. The presentation does not equate 24/7 availability with live stock prices or guaranteed execution. No financial calculations or contracts were changed.
- Prior evidence in this task: a user-signed mainnet deposit transferred NVDAc into Morpho and updated the displayed position. Slide 4 describes only this verified deposit sequence. It deliberately omits the user's address, hash and balances. It is not proof of customer adoption. No financial operation was performed for the presentation.
- The current live app is [Kora](https://stockline-chi.vercel.app/app). Only NVDAc is enabled; other stock entries are coming soon. The local icon refinements are not yet published, so the deck uses a clearly marked conceptual interface rather than implying all local changes are live.

## Presentation practice applied

- [Y Combinator: How to Design a Better Pitch Deck](https://www.ycombinator.com/blog/how-to-design-a-better-pitch-deck/): large readable type, one clear message per slide, selective content. Used as presentation guidance, not judging criteria for Base.
- [Devpost: Video-making best practices](https://help.devpost.com/article/84-video-making-best-practices): explain the application immediately, use a narrated screencast, rehearse and show how the product works. The script makes room for a brief actual app walkthrough; the mock interface is labeled instead of presented as a real recording.

## Assets and boundaries

- Manrope font downloaded from the [Google Fonts CSS endpoint](https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap), served locally for stable recordings. See [Manrope repository and license](https://github.com/sharanda/manrope).
- Kora and USDC assets are reused from the app. The NVDA symbol is extracted from the existing StockLogo component. No external account screenshot, invented logo URL, private wallet data, royalty claim, endorsement, traction statistic, audit certification, or funding claim was added.
- No submission, X post, Loom recording/upload or wallet signature was executed to create this deck. Repository publication and any automatic hosting deployment are separate from submission. No countdown is shown because the deadline timezone needs confirmation from the organizer.
