"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
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
            Deposits, borrows, and repayments will show up here.
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
                  className={`interactive-row flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left ${
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
