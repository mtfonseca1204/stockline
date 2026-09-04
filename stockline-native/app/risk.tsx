import { Button } from "@/components/ui/Button";
import { Badge, Card, StatRow } from "@/components/ui/Card";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { formatPct, formatUsd, ltv, safetyBuffer } from "@/lib/calculations";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RiskScreen() {
  const { health, currentLtv, credit, collateral, debt } = useApp();
  const buffer = safetyBuffer(currentLtv, credit.liquidationThreshold);

  const scenarios = [
    { drop: 0.1, label: "−10%" },
    { drop: 0.25, label: "−25%" },
    { drop: 0.4, label: "−40%" },
  ].map((s) => {
    const value = collateral * (1 - s.drop);
    const nextLtv = ltv(debt, value);
    let status: "Healthy" | "Caution" | "High risk" = "Healthy";
    if (nextLtv >= 0.48) status = "High risk";
    else if (nextLtv >= 0.38) status = "Caution";
    return { ...s, value, nextLtv, status };
  });

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Card style={styles.hero}>
        <Text style={styles.score}>{health.overall}</Text>
        <Text style={styles.scoreLabel}>Health · {health.status}</Text>
      </Card>

      <Card style={styles.list}>
        <StatRow label="LTV" value={formatPct(currentLtv)} />
        <StatRow label="Liquidation at" value={formatPct(credit.liquidationThreshold)} />
        <StatRow label="Buffer" value={formatPct(buffer)} accent />
      </Card>

      <Text style={styles.section}>If markets fall</Text>
      {scenarios.map((s) => (
        <Card key={s.label} style={styles.scenario}>
          <View style={styles.row}>
            <Text style={styles.scenarioTitle}>{s.label}</Text>
            <Badge
              label={s.status}
              tone={
                s.status === "Healthy"
                  ? "green"
                  : s.status === "Caution"
                    ? "amber"
                    : "red"
              }
            />
          </View>
          <Text style={styles.meta}>
            {formatUsd(s.value)} · LTV {formatPct(s.nextLtv)}
          </Text>
        </Card>
      ))}

      <Button title="Add collateral" onPress={() => router.push("/deposit")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md, paddingBottom: 40 },
  hero: { padding: spacing.xxl, alignItems: "center", gap: 6 },
  score: { fontSize: 48, fontWeight: "700", color: colors.lime },
  scoreLabel: { fontSize: 14, color: colors.inkMuted },
  list: { paddingHorizontal: spacing.lg },
  section: { marginTop: 8, fontSize: 15, fontWeight: "700", color: colors.ink },
  scenario: { padding: spacing.lg, gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scenarioTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  meta: { fontSize: 13, color: colors.inkMuted },
});
