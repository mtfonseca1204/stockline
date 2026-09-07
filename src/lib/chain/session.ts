export type Session = { open: number; close: number };
export function sessionStatus(sessions: readonly Session[], now: number) {
  const current = sessions.find((s) => now >= s.open && now < s.close);
  if (current) return { state: "open" as const, at: current.close };
  const next = sessions.find((s) => s.open > now);
  if (next) return { state: "closed" as const, at: next.open };
  return { state: "unavailable" as const, at: null };
}
