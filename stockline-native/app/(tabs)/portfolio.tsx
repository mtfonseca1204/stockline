import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { formatUsd, holdingValue } from "@/lib/calculations";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function PortfolioScreen() {
  const { holdings, collateral } = useApp();

  return (
    <Screen
      title="Portfolio"
      subtitle={`${formatUsd(collateral)} collateral`}
      right={
        <Button
          title="Supply"
          variant="soft"
          onPress={() => router.push("/deposit")}
          style={{ minHeight: 40 }}
        />
      }
    >
      <Card style={styles.list}>
        <View style={styles.head}>
          <Text style={styles.headLeft}>Asset</Text>
          <Text style={styles.headRight}>Value</Text>
        </View>
        {holdings.map((h) => {
          const value = holdingValue(h);
          const pct = collateral > 0 ? (value / collateral) * 100 : 0;
          return (
            <View key={h.ticker} style={styles.row}>
              <View>
                <Text style={styles.ticker}>{h.ticker}</Text>
                <Text style={styles.meta}>
                  {pct.toFixed(0)}% · {(h.yieldApr * 100).toFixed(1)}% yield
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.value}>{formatUsd(value)}</Text>
                <Text
                  style={{
                    color: h.change24h >= 0 ? colors.success : colors.danger,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {h.change24h >= 0 ? "+" : ""}
                  {h.change24h.toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { overflow: "hidden" },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headLeft: { fontSize: 12, color: colors.inkSubtle, fontWeight: "600" },
  headRight: { fontSize: 12, color: colors.inkSubtle, fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ticker: { fontSize: 16, fontWeight: "700", color: colors.ink },
  meta: { marginTop: 3, fontSize: 12, color: colors.inkMuted },
  value: { fontSize: 15, fontWeight: "700", color: colors.ink },
});
