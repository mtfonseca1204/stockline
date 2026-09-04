import { colors, radii, spacing } from "@/constants/theme";
import { formatPct } from "@/lib/calculations";
import { StyleSheet, Text, View } from "react-native";

export function LtvMeter({
  currentLtv,
  maxLtv = 0.55,
}: {
  currentLtv: number;
  maxLtv?: number;
}) {
  const pct = Math.min(100, (currentLtv / maxLtv) * 100);

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>LTV {formatPct(currentLtv)}</Text>
        <Text style={styles.label}>Max {formatPct(maxLtv)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  track: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.lime,
    borderRadius: radii.full,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: { fontSize: 12, color: colors.inkSubtle, fontWeight: "600" },
});
