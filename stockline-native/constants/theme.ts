export const colors = {
  bg: "#070A08",
  bgElevated: "#0E1410",
  surface: "rgba(255,255,255,0.06)",
  surfaceStrong: "rgba(255,255,255,0.09)",
  surfaceMuted: "rgba(255,255,255,0.04)",
  ink: "#F4F7F2",
  inkMuted: "#9AA59B",
  inkSubtle: "#6B766E",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.16)",
  lime: "#B8F000",
  limeHover: "#A3D600",
  limeDark: "#D4FF4F",
  limeSoft: "rgba(184, 240, 0, 0.14)",
  success: "#3DDC97",
  successSoft: "rgba(61, 220, 151, 0.14)",
  warning: "#F5B942",
  warningSoft: "rgba(245, 185, 66, 0.14)",
  danger: "#FF6B7A",
  dangerSoft: "rgba(255, 107, 122, 0.14)",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.55)",
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
