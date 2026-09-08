"use client";

import { LegacyPosition } from "@/components/screens/LegacyPosition";
import { MarketSessionNotice } from "@/components/MarketSessionNotice";
import { AlertStack } from "@/components/alerts/AlertStack";
import { BottomNav, TopBar } from "@/components/layout/Nav";
import { Onboarding, useNeedsOnboarding } from "@/components/Onboarding";
import { Activity } from "@/components/screens/Activity";
import { Borrow } from "@/components/screens/Borrow";
import { Deposit } from "@/components/screens/Deposit";
import { Home } from "@/components/screens/Home";
import { LandingPage } from "@/components/screens/LandingPage";
import { LoanDetail } from "@/components/screens/LoanDetail";
import { Portfolio, StockDetail } from "@/components/screens/Portfolio";
import { Withdraw } from "@/components/screens/Withdraw";
import { Repay } from "@/components/screens/Repay";
import { WalletModal } from "@/components/wallet/WalletModal";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

export function AppShell() {
  const { view, startApp } = useApp();
  const [walletOpen, setWalletOpen] = useState(false);
  const { ready, needs, clear, reset } = useNeedsOnboarding();

  const openWallet = () => {
    if (view === "landing") clear();
    setWalletOpen(true);
  };

  if (!ready) {
    return <div className="min-h-screen bg-[var(--bg)]" />;
  }

  if (needs && view !== "landing") {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <MarketSessionNotice />
        <Onboarding onDone={clear} onConnect={openWallet} />
        <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <TopBar onConnect={openWallet} wide={view === "landing"} />
      {view !== "landing" && <MarketSessionNotice />}
      <main className="flex-1 pb-28">
        {view !== "landing" && <LegacyPosition />}
        {view === "landing" && (
          <LandingPage
            onConnect={openWallet}
            onDemo={() => { clear(); startApp(); }}
            onReplayOnboarding={() => { reset(); startApp(); }}
          />
        )}
        {view === "home" && <Home />}
        {view === "portfolio" && <Portfolio />}
        {view === "borrow" && <Borrow />}
        {view === "activity" && <Activity />}
        {view === "deposit" && <Deposit />}
        {view === "repay" && <Repay />}
        {view === "withdraw" && <Withdraw />}
        {view === "loan" && <LoanDetail />}
        {view === "stock" && <StockDetail />}
      </main>
      {view !== "landing" ? <BottomNav /> : null}
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      <AlertStack />
    </div>
  );
}
