export const colors = {
  bg: "#F7F8FA",
  bgElevated: "#FFFFFF",
  surface: "rgba(0,82,255,0.04)",
  surfaceStrong: "rgba(0,82,255,0.08)",
  surfaceMuted: "rgba(10,11,13,0.03)",
  ink: "#0A0B0D",
  inkMuted: "#5B616E",
  inkSubtle: "#8A919E",
  border: "rgba(10,11,13,0.08)",
  borderStrong: "rgba(10,11,13,0.14)",
  /** Brand accent — Base blue (kept as `lime` keys for existing call sites) */
  lime: "#0052FF",
  limeHover: "#0041CC",
  limeDark: "#4D82FF",
  limeSoft: "rgba(0, 82, 255, 0.12)",
  success: "#0052FF",
  successSoft: "rgba(0, 82, 255, 0.12)",
  warning: "#B45309",
  warningSoft: "rgba(180, 83, 9, 0.12)",
  danger: "#CF222E",
  dangerSoft: "rgba(207, 34, 46, 0.12)",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(10,11,13,0.45)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
};

/** Shared glass panel style for RN (blur approximated via translucency) */
export const glass = {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.lg,
} as const;

export const glassStrong = {
  backgroundColor: colors.surfaceStrong,
  borderWidth: 1,
  borderColor: colors.borderStrong,
  borderRadius: radii.lg,
} as const;
