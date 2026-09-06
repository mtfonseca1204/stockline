"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/** Restrained confetti burst for major success moments */
export function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (i % 7) * 14 - 42 + (i % 3) * 4,
        delay: (i % 8) * 0.04,
        rotate: (i * 47) % 360,
        color: i % 3 === 0 ? "#0052FF" : i % 3 === 1 ? "#93B4FF" : "#1E1E1E",
        size: 4 + (i % 4),
      })),
    []
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-[28%] rounded-[1px]"
          style={{
            width: p.size,
            height: p.size * 0.55,
            background: p.color,
          }}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: p.x * 2.2,
            y: [0, -30 - (p.id % 5) * 8, 90 + (p.id % 4) * 20],
            rotate: p.rotate,
            scale: 1,
          }}
          transition={{ duration: 1.35, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
