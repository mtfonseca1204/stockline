import { Card } from "@/components/ui/Card";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/calculations";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export function FollowUpPanel() {
  const {
    changeLog,
    lastCompletedId,
    clearLastCompleted,
    credit,
    debt,
    repaidPct,
  } = useApp();

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lastCompletedId) return;
    pulse.setValue(0);
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start(() => clearLastCompleted());
  }, [lastCompletedId, pulse, clearLastCompleted]);

  const latest = changeLog.slice(0, 5);
  const highlight = changeLog.find((c) => c.id === lastCompletedId);

  return (
    <Card style={styles.panel}>
      <Text style={styles.title}>Follow-up</Text>
      <Text style={styles.sub}>Track every change as you complete actions.</Text>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Debt payoff</Text>
          <Text style={styles.progressPct}>{repaidPct}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${repaidPct}%` }]} />
        </View>
        <Text style={styles.progressMeta}>
          {formatUsd(Math.max(0, credit.originalDebt - debt))} repaid of{" "}
          {formatUsd(credit.originalDebt || debt)}
        </Text>
      </View>

      {highlight ? (
        <Animated.View
          style={[
            styles.completedBanner,
            {
              opacity: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.55, 1],
              }),
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.98, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.completedEyebrow}>Just completed</Text>
          <Text style={styles.completedTitle}>{highlight.title}</Text>
          <Text style={styles.completedDetail}>{highlight.detail}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.feed}>
        {latest.length === 0 ? (
          <Text style={styles.empty}>No changes yet — borrow or generate yield.</Text>
        ) : (
          latest.map((item) => (
            <View
              key={item.id}
              style={[
                styles.row,
                item.id === lastCompletedId && styles.rowActive,
              ]}
            >
              <View style={styles.dot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowDetail}>{item.detail}</Text>
              </View>
              <Text style={styles.done}>Done</Text>
            </View>
          ))
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: { padding: spacing.xl, gap: 12 },
  title: {
    fontSize: 18,
    fontFamily: "ArchivoBlack_400Regular",
    color: colors.ink,
    letterSpacing: -0.4,
    textTransform: "uppercase",
  },
  sub: { fontSize: 13, color: colors.inkMuted, marginTop: -4 },
  progressBlock: { gap: 8, marginTop: 4 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: { fontSize: 13, color: colors.inkMuted },
  progressPct: { fontSize: 14, fontWeight: "800", color: colors.lime },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.lime,
    borderRadius: 999,
  },
  progressMeta: { fontSize: 12, color: colors.inkSubtle },
  completedBanner: {
    borderWidth: 1,
    borderColor: colors.lime,
    backgroundColor: colors.limeSoft,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  completedEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.lime,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  completedTitle: { fontSize: 16, fontWeight: "800", color: colors.ink },
  completedDetail: { fontSize: 13, color: colors.inkMuted },
  feed: { gap: 0, marginTop: 4 },
  empty: { fontSize: 13, color: colors.inkSubtle, paddingVertical: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowActive: { backgroundColor: colors.limeSoft, marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 12 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lime,
  },
  rowTitle: { fontSize: 14, fontWeight: "700", color: colors.ink },
  rowDetail: { marginTop: 2, fontSize: 12, color: colors.inkMuted },
  done: { fontSize: 11, fontWeight: "700", color: colors.success },
});
