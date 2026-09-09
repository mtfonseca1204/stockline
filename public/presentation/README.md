# Kora presentation

Open http://localhost:3005/presentation/index.html with the existing local server. Pure HTML/CSS/JavaScript, no app routes changed. Six slides, designed at 1600 × 900 for a 16:9 recording. Portrait phones use a scrollable layout rather than shrinking text to unreadable sizes.

Navigate with Left/Right, Space, Page Up/Down, Home/End, or the footer buttons. Deep links use #1 through #6. Text fields retain their normal keys. Reduced-motion preference disables animations. Slides do not advance automatically. Each explanatory animation settles within four seconds.

For Loom, use a 16:9 browser viewport, hide bookmarks and notifications, and record this new tab. A 2–3 minute script is in SPEAKER-NOTES.md. The slides contain no wallet addresses, transaction hashes, real balances or credentials. The product illustration is explicitly labeled and its round amounts are fictional. No buttons in that illustration perform an action. The final link opens the live app in another tab.

The deck uses Kora's Manrope typography and blue palette. The font is served locally for reliable recording. NVDA artwork is reused from the app's existing StockLogo component; USDC and Kora marks come from existing public assets. No new icon or presentation framework is required.

This is a presentation companion. Recording a Loom, posting to X and submitting the form are separate actions. The presentation does not require the separate navigation-icon changes.

See SOURCES.md for research, evidence boundaries and submission requirements.

Verification: run `node public/presentation/verify.mjs` from the repository root while localhost:3005 is running. It uses the existing Playwright dependency, checks all six slides at 1600×900, 1280×720 and 390×844, and writes review screenshots to `/tmp/kora-deck-<width>-<slide>.png`. It checks keyboard and click navigation, deep-link reload, text-field key handling, text bounds and finite motion. `npx eslint public/presentation/deck.js public/presentation/verify.mjs` checks the scripts.
