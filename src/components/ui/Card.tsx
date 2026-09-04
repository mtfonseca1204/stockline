"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  quiet,
}: {
  children: ReactNode;
  className?: string;
  quiet?: boolean;
}) {
  return (
    <div className={cn(quiet ? "surface-quiet" : "surface", "p-5", className)}>
      {children}
    </div>
  );
}
