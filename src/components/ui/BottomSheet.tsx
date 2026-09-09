"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function BottomSheet({ title, children, dismissible = true, onClose, headerAction }: {
  title: string;
  headerAction?: ReactNode;
  children: ReactNode;
  dismissible?: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      className="fixed inset-x-0 bottom-0 top-auto m-0 mx-auto max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-[var(--border)] bg-[var(--bg)] p-0 text-[var(--ink)] shadow-2xl backdrop:bg-black/40"
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); if (dismissible) onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || !dismissible) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg)] px-5 py-4">
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        <div className="flex shrink-0 items-center gap-1">
          {headerAction}
          <button type="button" aria-label="Close action" disabled={!dismissible} onClick={onClose} className="rounded-full p-2 hover:bg-[var(--accent-soft)] disabled:opacity-40">
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
    </dialog>
  );
}
