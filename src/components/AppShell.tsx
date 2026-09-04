"use client";

import { AlertStack } from "@/components/alerts/AlertStack";
import { Navbar } from "@/components/layout/Navbar";
import { Onboarding, useNeedsOnboarding } from "@/components/Onboarding";
import { Activity } from "@/components/screens/Activity";
import { AutoRepaySettings } from "@/components/screens/AutoRepaySettings";
import { BorrowFlow } from "@/components/screens/BorrowFlow";
import { CreditPosition } from "@/components/screens/CreditPosition";
import { Dashboard } from "@/components/screens/Dashboard";
import { DepositFlow } from "@/components/screens/DepositFlow";
import { EmptyState } from "@/components/screens/EmptyState";
import { LandingPage } from "@/components/screens/LandingPage";
import { Portfolio } from "@/components/screens/Portfolio";
import { RiskHealth } from "@/components/screens/RiskHealth";
import { WithdrawFlow } from "@/components/screens/WithdrawFlow";
import { NoiseBackground } from "@/components/ui/NoiseBackground";
import { WalletModal } from "@/components/wallet/WalletModal";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

export function AppShell() {
  const { view } = useApp();
  const [walletOpen, setWalletOpen] = useState(false);
  const { ready, needs, clear } = useNeedsOnboarding();

  const openWallet = () => setWalletOpen(true);

  if (!ready) {
    return <div className="relative min-h-screen bg-[var(--bg)]" />;
  }

  if (needs) {
    return (
      <div className="relative min-h-screen">
        <NoiseBackground />
        <div className="relative z-10">
          <Onboarding onDone={clear} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--bg)]">
      <NoiseBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar onConnect={openWallet} />
        <main className="flex-1">
          {view === "landing" && <LandingPage onConnect={openWallet} />}
          {view === "dashboard" && <Dashboard />}
          {view === "portfolio" && <Portfolio />}
          {view === "credit" && <CreditPosition />}
          {view === "activity" && <Activity />}
          {view === "borrow" && <BorrowFlow />}
          {view === "deposit" && <DepositFlow />}
          {view === "withdraw" && <WithdrawFlow />}
          {view === "auto-repay" && <AutoRepaySettings />}
          {view === "risk" && <RiskHealth />}
          {view === "empty" && <EmptyState />}
        </main>
        <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
        <AlertStack />
      </div>
    </div>
  );
}
