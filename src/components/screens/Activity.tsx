"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Tooltip";
import { useApp } from "@/context/AppContext";

export function Activity() {
  const { activities } = useApp();

  return (
    <div className="page animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">Recent transactions</p>
      </div>

      {activities.length === 0 ? (
        <Card className="p-8 text-center text-sm text-[var(--ink-muted)]">
          No activity yet.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {activities.slice(0, 12).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {item.date} · {item.amount}
                </p>
              </div>
              <Badge
                tone={
                  item.status === "confirmed"
                    ? "green"
                    : item.status === "pending"
                      ? "amber"
                      : "red"
                }
              >
                {item.status === "confirmed"
                  ? "Done"
                  : item.status === "pending"
                    ? "Pending"
                    : "Failed"}
              </Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
