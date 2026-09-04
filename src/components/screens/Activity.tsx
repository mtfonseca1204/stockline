"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/calculations";
import { useMemo, useState } from "react";

export function Activity() {
  const { activities } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof activities>();
    for (const a of activities) {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    }
    return Array.from(map.entries());
  }, [activities]);

  const item = activities.find((a) => a.id === selected);

  if (activities.length === 0) {
    return (
      <div className="page animate-fade-up">
        <h1 className="text-2xl text-[var(--ink)]">Activity</h1>
        <Card className="text-center">
          <p className="font-semibold text-[var(--ink)]">Nothing here yet</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Borrowing, deposits, and repayments will show up here.
          </p>
        </Card>
      </div>
    );
  }

  if (item) {
    return (
      <div className="page animate-fade-up">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-sm text-[var(--ink-muted)]"
        >
          ← Back
        </button>
        <Card className="mt-2 space-y-3">
          <p className="text-sm text-[var(--ink-subtle)]">{item.date}</p>
          <h1 className="text-xl text-[var(--ink)]">{item.label}</h1>
          <p className="text-2xl font-semibold text-[var(--ink)]">{item.amount}</p>
          <p className="text-sm text-[var(--ink-muted)]">
            {item.detail ?? `${item.action} · ${item.asset}`}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
            {item.status}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page animate-fade-up">
      <h1 className="text-2xl text-[var(--ink)]">Activity</h1>
      <div className="space-y-6">
        {grouped.map(([date, items]) => (
          <section key={date}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-subtle)]">
              {date}
            </h2>
            <div className="surface overflow-hidden">
              {items.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelected(a.id)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-[var(--bg)] ${
                    i > 0 ? "border-t border-[var(--border)]" : ""
                  }`}
                >
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{a.label}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{a.asset}</p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {a.amount}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function Deposit() {
  const { depositStocks, setView, hasPosition } = useApp();

  return (
    <div className="page animate-fade-up">
      <h1 className="text-2xl text-[var(--ink)]">Add stocks</h1>
      <p className="text-sm text-[var(--ink-muted)]">
        Deposit eligible tokenized stocks. They remain yours while backing your
        credit.
      </p>

      <Card className="space-y-3">
        {[
          ["AAPL", "$8,240"],
          ["NVDA", "$7,890"],
          ["META", "$5,420"],
          ["MSFT", "$3,930"],
        ].map(([t, v]) => (
          <div key={t} className="flex justify-between text-sm">
            <span className="font-semibold text-[var(--ink)]">{t}</span>
            <span className="text-[var(--ink-muted)]">{v}</span>
          </div>
        ))}
        <div className="border-t border-[var(--border)] pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>$25,480</span>
        </div>
      </Card>

      <Button
        size="lg"
        className="w-full"
        onClick={() => depositStocks()}
      >
        {hasPosition ? "Add demo stocks" : "Deposit $25,480"}
      </Button>
      <Button variant="ghost" className="w-full" onClick={() => setView("home")}>
        Cancel
      </Button>
    </div>
  );
}

export function Withdraw() {
  const { withdrawable, withdrawStocks, setView, debt } = useApp();
  const [amount, setAmount] = useState(Math.min(7210, withdrawable));

  const safe = amount > 0 && amount <= withdrawable + 0.01;

  return (
    <div className="page animate-fade-up">
      <h1 className="text-2xl text-[var(--ink)]">Withdraw stocks</h1>

      <Card className="space-y-3">
        <p className="text-sm text-[var(--ink-muted)]">Available to withdraw</p>
        <p className="text-3xl font-semibold text-[var(--ink)]">
          {formatUsd(withdrawable)}
        </p>
        <input
          type="number"
          value={amount || ""}
          max={withdrawable}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-lg font-semibold outline-none focus:border-[var(--accent)]"
        />
        {safe ? (
          <p className="text-sm text-[var(--accent)]">
            You can withdraw this amount.
          </p>
        ) : (
          <p className="text-sm text-[var(--danger)]">
            You can&apos;t withdraw this much yet.
            {debt > 0
              ? " Your remaining stocks would not provide enough backing for your current loan."
              : ""}
          </p>
        )}
      </Card>

      <Button
        size="lg"
        className="w-full"
        disabled={!safe}
        onClick={() => withdrawStocks(amount)}
      >
        Withdraw
      </Button>
      <Button variant="ghost" className="w-full" onClick={() => setView("portfolio")}>
        Cancel
      </Button>
    </div>
  );
}
