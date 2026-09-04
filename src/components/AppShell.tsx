"use client";

import { AlertStack } from "@/components/alerts/AlertStack";
import { DemoBar } from "@/components/demo/DemoBar";
import { BottomNav, TopBar } from "@/components/layout/Nav";
import { Onboarding, useNeedsOnboarding } from "@/components/Onboarding";
import { Activity, Deposit, Withdraw } from "@/components/screens/Activity";
import { Borrow } from "@/components/screens/Borrow";
import { Home } from "@/components/screens/Home";
import { LandingPage } from "@/components/screens/LandingPage";
import { LoanDetail } from "@/components/screens/LoanDetail";
import { Portfolio, StockDetail } from "@/components/screens/Portfolio";
import { WalletModal } from "@/components/wallet/WalletModal";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

export function AppShell() {
  const { view, enableDemoMode } = useApp();
  const [walletOpen, setWalletOpen] = useState(false);
  const { ready, needs, clear } = useNeedsOnboarding();

  const openWallet = () => setWalletOpen(true);

  if (!ready) {
    return <div className="min-h-screen bg-[var(--bg)]" />;
  }

  if (needs) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <Onboarding onDone={clear} onConnect={openWallet} />
        <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <TopBar onConnect={openWallet} />
      <main className="flex-1">
        {view === "landing" && (
          <LandingPage onConnect={openWallet} onDemo={enableDemoMode} />
        )}
        {view === "home" && <Home />}
        {view === "portfolio" && <Portfolio />}
        {view === "borrow" && <Borrow />}
        {view === "activity" && <Activity />}
        {view === "deposit" && <Deposit />}
        {view === "withdraw" && <Withdraw />}
        {view === "loan" && <LoanDetail />}
        {view === "stock" && <StockDetail />}
      </main>
      {view !== "landing" ? <BottomNav /> : null}
      <DemoBar />
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      <AlertStack />
    </div>
  );
}
