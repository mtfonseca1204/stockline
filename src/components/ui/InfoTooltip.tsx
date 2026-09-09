"use client";

import { Info } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function InfoTooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const id = useId();
  const pointerType = useRef("");

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissEscape);
    };
  }, [open]);

  return (
    <span
      ref={root}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse" && !root.current?.querySelector(":focus-visible")) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setOpen(true); }}
        onBlur={() => setOpen(false)}
        onPointerDown={(event) => { pointerType.current = event.pointerType; }}
        onClick={() => setOpen((value) => pointerType.current === "touch" ? !value : true)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--ink-muted)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <Info size={14} aria-hidden="true" />
      </button>
      {open && (
        <span id={id} role="tooltip" className="absolute inset-x-0 top-full z-20 mt-2 rounded-xl border border-[var(--border)] bg-white p-3 text-sm leading-relaxed text-[var(--ink)] shadow-lg">
          {children}
        </span>
      )}
    </span>
  );
}
