import { Button } from "@/components/ui/Button";
import { Card, StatRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import {
  availableCredit,
  formatPct,
  formatUsd,
  ltv,
} from "@/lib/calculations";
import { DEMO_HOLDINGS } from "@/lib/mock-data";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function DepositScreen() {
  const { holdings, debt, credit, depositCollateral } = useApp();
  const assets = useMemo(() => {
    const source = holdings.length === 0 ? DEMO_HOLDINGS : holdings;
    return source.map((h) => ({
      ticker: h.ticker,
      name: h.name,
      available: h.availableToDeposit * h.price,
    }));
  }, [holdings]);

  const [selected, setSelected] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedTotal = Object.values(selected).reduce((a, b) => a + b, 0);
  const currentCollateral = holdings.reduce(
    (s, h) => s + h.quantity * h.price,
    0
  );
  const newCollateral = currentCollateral + selectedTotal;
  const newAvailable = availableCredit(newCollateral, debt, credit.maxLtv);
  const newLtv = ltv(debt, newCollateral);

  const toggle = (ticker: string, available: number) => {
    setSelected((prev) => {
      if (prev[ticker] != null) {
        const next = { ...prev };
        delete next[ticker];
        return next;
      }
      return { ...prev, [ticker]: Math.round(available) };
    });
  };

  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    depositCollateral(selected);
    setLoading(false);
    setOpen(false);
    router.replace("/(tabs)/portfolio");
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Card style={styles.list}>
        {assets.map((asset) => {
          const on = selected[asset.ticker] != null;
          return (
            <View key={asset.ticker} style={styles.asset}>
              <Pressable
                style={styles.assetRow}
                onPress={() => toggle(asset.ticker, asset.available)}
              >
                <View
                  style={[
                    styles.check,
                    on && {
                      backgroundColor: colors.lime,
                      borderColor: colors.lime,
                    },
                  ]}
                >
                  {on ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ticker}>{asset.ticker}</Text>
                  <Text style={styles.avail}>
                    {formatUsd(asset.available)} available
                  </Text>
                </View>
              </Pressable>
              {on ? (
                <TextInput
                  keyboardType="numeric"
                  value={String(Math.round(selected[asset.ticker] ?? 0))}
                  onChangeText={(t) =>
                    setSelected((prev) => ({
                      ...prev,
                      [asset.ticker]: Math.min(
                        asset.available,
                        Math.max(0, Number(t) || 0)
                      ),
                    }))
                  }
                  style={styles.amountInput}
                />
              ) : null}
            </View>
          );
        })}
      </Card>

      <Card style={styles.panel}>
        <StatRow label="Selected" value={formatUsd(selectedTotal)} accent />
        <StatRow label="New credit" value={formatUsd(newAvailable)} />
        <StatRow label="New LTV" value={formatPct(newLtv)} />
      </Card>

      <Button
        title="Review deposit"
        disabled={selectedTotal <= 0}
        onPress={() => setOpen(true)}
      />

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        loading={loading}
        title="Confirm deposit"
        description="Selected stocks will secure your credit line."
        details={[
          { label: "Deposit", value: formatUsd(selectedTotal) },
          { label: "New available credit", value: formatUsd(newAvailable) },
          { label: "New LTV", value: formatPct(newLtv) },
        ]}
        confirmLabel="Confirm deposit"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md, paddingBottom: 40 },
  list: { overflow: "hidden" },
  asset: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  assetRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { fontSize: 12, fontWeight: "700", color: colors.bg },
  ticker: { fontSize: 16, fontWeight: "700", color: colors.ink },
  avail: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  amountInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surfaceMuted,
  },
  panel: { paddingHorizontal: spacing.lg },
});
