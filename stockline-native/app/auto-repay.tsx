import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import {
  formatUsd,
  monthlyRepayment,
  projectedPayoffMonths,
} from "@/lib/calculations";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const OPTIONS = [
  { value: 100, title: "100%", desc: "All yield to debt" },
  { value: 75, title: "75%", desc: "Most yield to debt" },
  { value: 50, title: "50%", desc: "Split with balance" },
  { value: -1, title: "Custom", desc: "Choose your %" },
];

export default function AutoRepayScreen() {
  const { credit, yieldMonthly, debt, setAutoRepay } = useApp();
  const [choice, setChoice] = useState(
    [100, 75, 50].includes(credit.autoRepayPercent)
      ? credit.autoRepayPercent
      : -1
  );
  const [custom, setCustom] = useState(60);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const percent = choice === -1 ? custom : choice;
  const repay = monthlyRepayment(yieldMonthly, percent);
  const payoff = projectedPayoffMonths(debt, repay);

  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setAutoRepay(true, percent);
    setLoading(false);
    setOpen(false);
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.desc}>How much yield should repay your loan?</Text>

      <Card style={styles.list}>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.title}
            onPress={() => setChoice(opt.value)}
            style={[
              styles.option,
              choice === opt.value && { backgroundColor: colors.limeSoft },
            ]}
          >
            <Text style={styles.optionTitle}>{opt.title}</Text>
            <Text style={styles.optionDesc}>{opt.desc}</Text>
          </Pressable>
        ))}
      </Card>

      {choice === -1 ? (
        <Card style={styles.panel}>
          <Text style={styles.label}>Custom: {custom}%</Text>
          <View style={styles.chips}>
            {[25, 40, 60, 80, 90].map((v) => (
              <Button
                key={v}
                title={`${v}%`}
                variant={custom === v ? "primary" : "ghost"}
                style={styles.chip}
                onPress={() => setCustom(v)}
              />
            ))}
          </View>
        </Card>
      ) : null}

      <Card style={styles.panelPad}>
        <StatRow label="Monthly yield" value={formatUsd(yieldMonthly)} />
        <StatRow label="Repayment" value={formatUsd(repay)} accent />
        <StatRow
          label="Est. payoff"
          value={payoff ? `${payoff} months` : "—"}
        />
      </Card>

      <Button title="Review Auto-Repay" onPress={() => setOpen(true)} />

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        loading={loading}
        title="Enable Auto-Repay?"
        description={`${percent}% of generated yield will go toward your debt.`}
        details={[
          { label: "Share", value: `${percent}%` },
          { label: "Monthly repayment", value: formatUsd(repay) },
          { label: "Est. payoff", value: payoff ? `${payoff} months` : "—" },
        ]}
        confirmLabel="Enable Auto-Repay"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md, paddingBottom: 40 },
  desc: { fontSize: 14, color: colors.inkMuted, lineHeight: 20 },
  list: { overflow: "hidden" },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  optionTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  optionDesc: { fontSize: 13, color: colors.inkMuted },
  panel: { padding: spacing.lg, gap: 10 },
  panelPad: { paddingHorizontal: spacing.lg },
  label: { fontSize: 14, fontWeight: "600", color: colors.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { minHeight: 36 },
});
