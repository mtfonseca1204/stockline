"use client";

/** Animated film-grain noise overlay — shared visual language */
export function NoiseBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="noise-layer absolute inset-0 opacity-[0.35]" />
      <div className="noise-sweep absolute inset-0 opacity-40" />
    </div>
  );
}
