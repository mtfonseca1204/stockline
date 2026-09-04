import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LtvMeter } from "@/components/ui/Meters";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import {
  formatPct,
  formatUsd,
  ltv,
  maxSafeBorrow,
} from "@/lib/calculations";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function BorrowScreen() {
  const { collateral, debt, available, credit, borrowUsdc } = useApp();
  const maxBorrow = maxSafeBorrow(collateral, debt, credit.maxLtv);
  const [amount, setAmount] = useState(Math.min(4000, Math.max(0, maxBorrow)));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const afterLtv = ltv(debt + amount, collateral);

  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    borrowUsdc(amount);
    setLoading(false);
    setOpen(false);
    router.replace("/(tabs)/credit");
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Card style={styles.panel}>
        <Text style={styles.label}>Borrow amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            value={String(Math.round(amount))}
            keyboardType="numeric"
            onChangeText={(t) =>
              setAmount(Math.min(maxBorrow, Math.max(0, Number(t) || 0)))
            }
            style={styles.input}
          />
        </View>
        <View style={styles.chips}>
          {[0.25, 0.5, 1].map((p) => (
            <Button
              key={p}
              title={p === 1 ? "Max" : `${p * 100}%`}
              variant="ghost"
              style={styles.chip}
              onPress={() => setAmount(Math.round(maxBorrow * p))}
            />
          ))}
        </View>

        <StatRow label="Available" value={formatUsd(available)} accent />
        <StatRow label="LTV after" value={formatPct(afterLtv)} />
        <StatRow
          label="Interest"
          value={`${(credit.interestApr * 100).toFixed(1)}% APR`}
        />

        <LtvMeter currentLtv={afterLtv} maxLtv={credit.maxLtv} />

        <Button
          title="Review borrow"
          disabled={amount <= 0}
          onPress={() => setOpen(true)}
        />
      </Card>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        loading={loading}
        title="Confirm borrow"
        description="Your stocks stay invested while securing this loan."
        details={[
          { label: "Borrow", value: `${formatUsd(amount)} USDC` },
          { label: "Collateral", value: formatUsd(collateral) },
          { label: "LTV after", value: formatPct(afterLtv) },
        ]}
        confirmLabel="Confirm borrow"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: 40 },
  panel: { padding: spacing.lg, gap: 12 },
  label: { fontSize: 13, color: colors.inkMuted },
  amountRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  dollar: { fontSize: 34, fontWeight: "700", color: colors.ink },
  input: {
    flex: 1,
    fontSize: 34,
    fontWeight: "700",
    color: colors.ink,
    paddingVertical: 0,
  },
  chips: { flexDirection: "row", gap: 4 },
  chip: { minHeight: 36 },
});
