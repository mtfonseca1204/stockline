import { colors, glass, glassStrong, radii, spacing } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, Text, View, type ViewProps } from "react-native";

export function Card({
  children,
  style,
  strong,
  ...props
}: ViewProps & { strong?: boolean }) {
  const base = strong ? glassStrong : glass;
  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={strong ? 45 : 28}
        tint="dark"
        style={[base, style]}
        {...props}
      >
        {children}
      </BlurView>
    );
  }
  return (
    <View style={[base, style]} {...props}>
      {children}
    </View>
  );
}

export function StatRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: colors.lime }]}>
        {value}
      </Text>
    </View>
  );
}

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "lime" | "green" | "amber" | "red";
}) {
  return (
    <View
      style={[
        styles.badge,
        tone === "lime" && styles.badgeLime,
        tone === "green" && styles.badgeGreen,
        tone === "amber" && styles.badgeAmber,
        tone === "red" && styles.badgeRed,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          tone === "lime" && { color: colors.lime },
          tone === "green" && { color: colors.success },
          tone === "amber" && { color: colors.warning },
          tone === "red" && { color: colors.danger },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLabel: { fontSize: 14, color: colors.inkMuted },
  statValue: { fontSize: 14, fontWeight: "700", color: colors.ink },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.surfaceMuted,
  },
  badgeLime: { backgroundColor: colors.limeSoft },
  badgeGreen: { backgroundColor: colors.successSoft },
  badgeAmber: { backgroundColor: colors.warningSoft },
  badgeRed: { backgroundColor: colors.dangerSoft },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.inkMuted,
  },
});
