import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { formatPct, formatUsd, ltv } from "@/lib/calculations";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function WithdrawScreen() {
  const { collateral, debt, credit, withdrawCollateral } = useApp();
  const [amount, setAmount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const maxWithdraw = useMemo(() => {
    const safeLtv = credit.maxLtv * 0.8;
    if (debt <= 0) return collateral;
    const minCollateral = debt / safeLtv;
    return Math.max(0, collateral - minCollateral);
  }, [collateral, debt, credit.maxLtv]);

  const remaining = collateral - amount;
  const resultingLtv = ltv(debt, remaining);
  const safe = amount <= maxWithdraw + 0.01 && resultingLtv < credit.maxLtv;

  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    withdrawCollateral(amount);
    setLoading(false);
    setOpen(false);
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Card style={styles.panel}>
        <StatRow label="Collateral" value={formatUsd(collateral)} />
        <StatRow label="Debt" value={formatUsd(debt)} />
        <StatRow label="Available" value={formatUsd(maxWithdraw)} accent />

        <Text style={styles.label}>Withdraw amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            keyboardType="numeric"
            value={String(Math.round(amount))}
            onChangeText={(t) => setAmount(Math.max(0, Number(t) || 0))}
            style={styles.input}
          />
        </View>

        <View style={styles.chips}>
          <Button
            title="50%"
            variant="ghost"
            style={styles.chip}
            onPress={() => setAmount(Math.round(maxWithdraw * 0.5))}
          />
          <Button
            title="Max safe"
            variant="ghost"
            style={styles.chip}
            onPress={() => setAmount(Math.round(maxWithdraw))}
          />
        </View>

        <View
          style={[
            styles.status,
            {
              backgroundColor: safe ? colors.successSoft : colors.dangerSoft,
            },
          ]}
        >
          <Text
            style={{
              color: safe ? colors.success : colors.danger,
              fontWeight: "600",
              fontSize: 13,
            }}
          >
            {safe
              ? `Withdrawal available · LTV ${formatPct(resultingLtv)}`
              : "Withdrawal unavailable — would exceed safe LTV"}
          </Text>
        </View>

        <Button
          title="Review withdraw"
          disabled={!safe || amount <= 0}
          onPress={() => setOpen(true)}
        />
      </Card>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        loading={loading}
        title="Confirm withdraw"
        description="Only collateral that keeps your loan safely backed will be released."
        details={[
          { label: "Withdraw", value: formatUsd(amount) },
          { label: "Remaining collateral", value: formatUsd(remaining) },
          { label: "LTV after", value: formatPct(resultingLtv) },
        ]}
        confirmLabel="Confirm withdraw"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md, paddingBottom: 40 },
  panel: { padding: spacing.lg, gap: 12 },
  label: { fontSize: 13, color: colors.inkMuted, marginTop: 4 },
  amountRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  dollar: { fontSize: 30, fontWeight: "700", color: colors.ink },
  input: { flex: 1, fontSize: 30, fontWeight: "700", color: colors.ink },
  chips: { flexDirection: "row", gap: 4 },
  chip: { minHeight: 36 },
  status: { borderRadius: 14, padding: 12 },
});
