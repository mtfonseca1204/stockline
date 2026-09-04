import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LtvMeter } from "@/components/ui/Meters";
import { Screen } from "@/components/ui/Screen";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { formatSignedUsd, formatUsd } from "@/lib/calculations";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function CreditScreen() {
  const {
    collateral,
    debt,
    yieldMonthly,
    repayMonthly,
    payoffMonths,
    credit,
    currentLtv,
    setAutoRepay,
  } = useApp();

  const [confirm, setConfirm] = useState<"on" | "off" | null>(null);
  const [loading, setLoading] = useState(false);

  const runToggle = async () => {
    if (!confirm) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setAutoRepay(confirm === "on", credit.autoRepayPercent);
    setLoading(false);
    setConfirm(null);
  };

  return (
    <Screen title="Credit" subtitle="Your loan and how it gets repaid.">
      <Card style={styles.panel}>
        <View style={styles.pair}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Collateral</Text>
            <Text style={styles.value}>{formatUsd(collateral)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Debt</Text>
            <Text style={styles.value}>{formatUsd(debt)}</Text>
          </View>
        </View>

        <LtvMeter currentLtv={currentLtv} maxLtv={credit.maxLtv} />

        <StatRow
          label="Yield"
          value={`${formatSignedUsd(yieldMonthly)}/mo`}
          accent
        />
        <StatRow
          label="Auto-repay"
          value={
            credit.autoRepayEnabled
              ? `−${formatUsd(repayMonthly)}/mo`
              : "Off"
          }
        />
        <StatRow
          label="Est. payoff"
          value={payoffMonths ? `${payoffMonths} months` : "—"}
        />

        <View style={styles.toggleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Auto-Repay</Text>
            <Text style={styles.toggleBody}>Send yield to debt automatically.</Text>
          </View>
          <Pressable
            onPress={() =>
              setConfirm(credit.autoRepayEnabled ? "off" : "on")
            }
            style={[
              styles.toggle,
              {
                backgroundColor: credit.autoRepayEnabled
                  ? colors.lime
                  : colors.borderStrong,
              },
            ]}
          >
            <View
              style={[
                styles.knob,
                {
                  alignSelf: credit.autoRepayEnabled ? "flex-end" : "flex-start",
                },
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Button
            title="Borrow more"
            style={{ flex: 1 }}
            onPress={() => router.push("/borrow")}
          />
          <Button
            title="Withdraw"
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => router.push("/withdraw")}
          />
        </View>

        <Button
          title="Adjust %"
          variant="ghost"
          onPress={() => router.push("/auto-repay")}
        />
      </Card>

      <ConfirmModal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={runToggle}
        loading={loading}
        title={confirm === "on" ? "Enable Auto-Repay?" : "Turn off Auto-Repay?"}
        description={
          confirm === "on"
            ? "Yield from your stocks will be applied to your outstanding debt."
            : "Yield will stay available to you instead of paying down debt."
        }
        details={[
          { label: "Debt", value: formatUsd(debt) },
          { label: "Share", value: `${credit.autoRepayPercent}%` },
        ]}
        confirmLabel={confirm === "on" ? "Enable" : "Turn off"}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { padding: spacing.xl, gap: 14 },
  pair: { flexDirection: "row", gap: 16 },
  label: { fontSize: 13, color: colors.inkMuted },
  value: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "700",
    color: colors.ink,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  toggleTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  toggleBody: { marginTop: 2, fontSize: 13, color: colors.inkMuted },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 3,
    justifyContent: "center",
  },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.bg,
  },
  actions: { flexDirection: "row", gap: 10 },
});
