"use client";

import { useState } from "react";
import Image from "next/image";
import { LandingBorrowRate } from "./LandingBorrowRate";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Wallet,
  Layers3,
  Repeat2,
  LockKeyhole,
} from "lucide-react";
import { StockLogo } from "@/components/brand/StockLogo";
import styles from "./LandingPage.module.css";

const steps = [
  {
    icon: Wallet,
    title: "Bring your stocks.",
    text: "Connect your wallet and deposit NVDAc as collateral. Your position stays in your wallet’s name.",
  },
  {
    icon: Layers3,
    title: "Make room for more.",
    text: "Borrow USDC against your collateral. Keep your stock exposure while accessing liquidity.",
  },
  {
    icon: Repeat2,
    title: "Repay your way.",
    text: "Repay with USDC or sell part of your collateral. Withdraw the remaining stocks when your position allows.",
  },
];

export function LandingPage({
  onConnect,
  onDemo,
  onReplayOnboarding,
}: {
  onConnect: () => void;
  onDemo: () => void;
  onReplayOnboarding?: () => void;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} /> COINBASE TOKENIZED STOCKS. NEW POSSIBILITIES.
          </div>
          <h1>
            Your stocks as collateral.
            <br />
            <span>USDC to do more.</span>
          </h1>
          <p>
            Use Coinbase tokenized stocks as collateral to borrow USDC on Base.
            Start with NVIDIA (NVDAc), keep your stock exposure, and repay on your terms.
          </p>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={onDemo}>
              Borrow USDC <ArrowUpRight size={20} />
            </button>
            <a className={styles.textLink} href="#how-it-works">
              See how it works <ArrowRight size={17} />
            </a>
          </div>
          <div className={styles.heroFoot}>
            <span className={styles.baseMark} /> Built on Base{" "}
            <a href="https://morpho.org" target="_blank" rel="noreferrer" className={styles.morphoBadge}><Image src="/brand/powered-by-morpho.svg" alt="Powered by Morpho" width={265} height={38} /></a>
          </div>
          <LandingBorrowRate />
        </div>
        <div className={styles.creditScene} data-paused={paused}>
          <div className={styles.sceneGrid} aria-hidden="true" />
          <div className={styles.sceneOrbit} aria-hidden="true" />
          <div className={styles.sceneHeader}>
            <span>YOUR STOCKS → YOUR NEXT MOVE</span>
            <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
              {paused ? "Play animation" : "Pause animation"}
            </button>
          </div>
          <div className={styles.collateralCard}>
            <div className={styles.cardLabel}><span>01 / DEPOSIT COLLATERAL</span><LockKeyhole size={16} /></div>
            <div className={styles.stockIdentity}>
              <StockLogo ticker="NVDA" size={56} />
              <div><strong>NVIDIA</strong><span>NVDAc · Coinbase tokenized stock</span></div>
            </div>
            <div className={styles.cardBottom}><span>Your stock exposure</span><strong>Still yours</strong></div>
          </div>
          <div className={styles.creditBridge} aria-hidden="true"><svg width="54" height="54" viewBox="0 0 54 54"><path d="M8 6v24c0 8 4 12 12 12h24m-10-10 10 10-10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          <div className={styles.borrowCard}>
            <div className={styles.cardLabel}><span>02 / BORROW USDC</span><ArrowUpRight size={19} /></div>
            <div className={styles.usdcIdentity}><Image src="/brand/usdc.svg" alt="USDC" width={48} height={48} /><strong>USDC</strong></div>
            <p>Liquidity in your wallet.</p>
            <div className={styles.cardBottom}><span>Backed by your collateral</span><Wallet size={18} /></div>
          </div>
          <div className={styles.sceneCaption}><Repeat2 size={16} /> Repay USDC. Withdraw your stocks.</div>
        </div>
      </section>

      <section className={styles.marketStrip} aria-label="Supported markets">
        <div>
          <span className={styles.eyebrow}>
            STARTING WITH THE STOCKS YOU KNOW
          </span>
          <p>One market today. More possibilities ahead.</p>
        </div>
        <div className={styles.markets}>
          {[
            { ticker: "NVDA", label: "NVDAc", live: true },
            { ticker: "AAPL", label: "AAPLc", live: false },
            { ticker: "MSFT", label: "MSFTc", live: false },
            { ticker: "META", label: "METAc", live: false },
          ].map((asset) => (
            <div className={styles.market} key={asset.ticker}>
              <StockLogo ticker={asset.ticker} size={32} />
              <div>
                <strong>{asset.label}</strong>
                <span>{asset.live ? "Pilot available" : "Coming soon"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.how} id="how-it-works">
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>01 / THE IDEA IS SIMPLE</span>
          <h2>
            Hold your conviction.
            <br />
            <span>Give yourself options.</span>
          </h2>
          <p>
            A stock position doesn’t have to mean sitting still. Put it to work
            as collateral in three steps.
          </p>
        </div>
        <div className={styles.steps}>
          {steps.map(({ icon: Icon, title, text }, index) => (
            <article className={styles.step} key={title}>
              <div className={styles.stepTop}>
                <Icon size={25} strokeWidth={1.5} />
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.feature}>
        <div className={styles.featureCopy}>
          <span className={styles.eyebrow}>
            02 / BUILT AROUND YOUR POSITION
          </span>
          <h2>
            Liquidity that
            <br />
            fits your next move.
          </h2>
          <p>
            Choose how much to borrow and how to repay. See your collateral,
            debt and available credit before you make a move.
          </p>
          <button className={styles.lightButton} onClick={onConnect}>
            Connect your wallet <ArrowUpRight size={20} />
          </button>
        </div>
        <div className={styles.featureGrid}>
          <article>
            <span className={styles.featureNumber}>24/7</span>
            <h3>No scheduled closing bell.</h3>
            <p>
              The pilot operates outside market hours. Prices may be stale;
              safety checks and liquidity still apply.
            </p>
          </article>
          <article>
            <LockKeyhole size={32} strokeWidth={1.4} />
            <h3>Your wallet. Your approvals.</h3>
            <p>
              You sign each operation. Collateral is held in Morpho while
              deposited, with the position recorded in your name.
            </p>
          </article>
          <article>
            <span className={styles.featureNumber}>USDC</span>
            <h3>A familiar way to borrow.</h3>
            <p>
              Debt and repayments are denominated in USDC. Interest is variable
              and accrues while you have a loan.
            </p>
          </article>
          <article>
            <Repeat2 size={32} strokeWidth={1.4} />
            <h3>Two ways back.</h3>
            <p>
              Pay with USDC or sell part of the collateral to repay. You choose
              how much stock exposure to keep.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.faq}>
        <div>
          <span className={styles.eyebrow}>03 / A LITTLE CLARITY</span>
          <h2>
            Good questions.
            <br />
            <span>Straight answers.</span>
          </h2>
          <p>Understand your position before opening one.</p>
        </div>
        <div className={styles.questions}>
          {[
            [
              "What am I depositing?",
              "NVDAc, Coinbase’s tokenized NVIDIA stock on Base, is the collateral supported by the current pilot. It is not a traditional brokerage position. You can find a purchase link inside the app.",
            ],
            [
              "How much can I borrow?",
              "The app suggests a maximum of 50% of your collateral value, subject to available USDC liquidity and valid oracle checks. The market’s liquidation threshold is 77% loan-to-value. These are different limits.",
            ],
            [
              "Can my collateral be liquidated?",
              "Yes. A falling stock price or accumulating interest can make your position eligible for liquidation. Borrowing against stocks carries risk, and the pilot’s use of stale prices outside market hours adds risk.",
            ],
            [
              "Does 24/7 mean a live stock price?",
              "No. Prices can be stale during weekends, holidays and other gaps in updates. Pauses, invalid prices and safety checks can still block borrowing and liquidation.",
            ],
            [
              "Is this a finished financial product?",
              "This is a controlled hackathon pilot with real assets and real funds. The custom contracts have not undergone an independent security audit. Start by understanding the mechanics and the risks.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <Plus size={19} />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <span className={styles.eyebrow}>
          KEEP YOUR STOCKS. EXPLORE WHAT’S NEXT.
        </span>
        <h2>
          Your portfolio.
          <br />
          With room to move.
        </h2>
        <button className={styles.primary} onClick={onDemo}>
          Open app <ArrowUpRight size={20} />
        </button>
        <p>NVDAc pilot on Base · Real assets, real funds.</p>
      </section>
      <footer className={styles.footer}>
        <span>
          Kora{" "}
          <span className={styles.footerTag}>A new angle on your stocks.</span>
        </span>
        <div>
          <a href="#how-it-works">How it works</a>
          {onReplayOnboarding && (
            <button onClick={onReplayOnboarding}>Product walkthrough</button>
          )}
          <span>Built on Base</span>
        </div>
      </footer>
    </div>
  );
}
