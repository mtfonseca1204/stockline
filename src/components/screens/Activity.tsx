"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";
export function Activity() {
  const { history, historyError } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const item = history.find((a) => a.id === selected);
  if (item)
    return (
      <div className="page animate-fade-up">
        <button
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]"
          onClick={() => setSelected(null)}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <Card className="space-y-3">
          <p className="text-sm text-[var(--ink-subtle)]">
            {new Date(Number(item.timestamp) * 1000).toLocaleString()}
          </p>
          <h1 className="text-xl">{item.label}</h1>
          <p className="text-lg font-semibold">{item.detail}</p>
          <p className="text-sm text-[var(--ink-muted)]">
            Confirmed at block {item.block.toString()}
          </p>
          <p className="break-all text-xs text-[var(--ink-subtle)]">
            {item.hash}
          </p>
        </Card>
      </div>
    );
  return (
    <div className="page animate-fade-up">
      <h1 className="text-2xl">Activity</h1>
      {historyError && (
        <p role="alert">History unavailable. Please try again.</p>
      )}
      {!history.length && !historyError && (
        <Card className="text-center">
          <p className="font-semibold">Nothing here yet</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Deposits, borrows, and repayments will show up here.
          </p>
        </Card>
      )}
      <div className="surface overflow-hidden">
        {history.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setSelected(a.id)}
            className={`interactive-row flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left ${i ? "border-t border-[var(--border)]" : ""}`}
          >
            <div>
              <p className="font-semibold">{a.label}</p>
              <p className="text-xs text-[var(--ink-muted)]">
                {new Date(Number(a.timestamp) * 1000).toLocaleDateString()}
              </p>
            </div>
            <p className="text-right text-sm">{a.detail}</p>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}
