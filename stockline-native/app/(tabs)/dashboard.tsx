import { DemoPanel } from "@/components/DemoPanel";
import { FollowUpPanel } from "@/components/FollowUpPanel";
import { Button } from "@/components/ui/Button";
import { Badge, Card, StatRow } from "@/components/ui/Card";
import { LtvMeter } from "@/components/ui/Meters";
import { Screen } from "@/components/ui/Screen";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import {
  formatSignedUsd,
  formatUsd,
  greeting,
  shortAddress,
} from "@/lib/calculations";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function DashboardScreen() {
  const {
    collateral,
    available,
    debt,
    currentLtv,
    credit,
    yieldMonthly,
    repayMonthly,
    payoffMonths,
    walletAddress,
    disconnectWallet,
    demoMode,
    health,
  } = useApp();

  return (
    <Screen>
      <View style={styles.top}>
        <View>
          <Text style={styles.hello}>{greeting()}</Text>
          <Text style={styles.addr}>
            {walletAddress ? shortAddress(walletAddress) : ""}
          </Text>
        </View>
        <View style={styles.badges}>
          <Badge label="Base" tone="lime" />
          {demoMode ? <Badge label="Demo" tone="amber" /> : null}
        </View>
      </View>

      <Card style={styles.panel}>
        <Text style={styles.label}>Portfolio</Text>
        <Text style={styles.big}>{formatUsd(collateral)}</Text>
        <Text style={styles.health}>
          Health {health.overall} · {health.status}
        </Text>

        <View style={{ marginTop: 8 }}>
          <StatRow label="Available to borrow" value={formatUsd(available)} accent />
          <StatRow label="Debt" value={formatUsd(debt)} />
          <StatRow
            label="Monthly repayment"
            value={
              credit.autoRepayEnabled ? `−${formatUsd(repayMonthly)}` : "Off"
            }
          />
        </View>

        <View style={{ paddingTop: 12 }}>
          <LtvMeter currentLtv={currentLtv} maxLtv={credit.maxLtv} />
        </View>

        <View style={styles.inner}>
          <Text style={styles.innerTitle}>Self-repaying</Text>
          <Text style={styles.innerBody}>
            Yield {formatSignedUsd(yieldMonthly)}/mo
            {payoffMonths ? ` · ~${payoffMonths} mo to clear` : ""}
          </Text>
          <Button
            title="View credit"
            variant="soft"
            onPress={() => router.push("/(tabs)/credit")}
          />
        </View>
      </Card>

      <FollowUpPanel />

      <View style={styles.actions}>
        <Button
          title="Borrow"
          style={{ flex: 1 }}
          onPress={() => router.push("/borrow")}
        />
        <Button
          title="Supply"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => router.push("/deposit")}
        />
      </View>

      <DemoPanel />

      <Button
        title="Disconnect"
        variant="ghost"
        onPress={() => {
          disconnectWallet();
          router.replace("/");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  hello: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.6,
    fontFamily: "ArchivoBlack_400Regular",
  },
  addr: {
    marginTop: 4,
    fontSize: 13,
    color: colors.inkSubtle,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  badges: { gap: 6, alignItems: "flex-end" },
  panel: { padding: spacing.xl, gap: 6 },
  label: { fontSize: 13, color: colors.inkMuted },
  big: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -1.2,
    fontFamily: "ArchivoBlack_400Regular",
  },
  health: { fontSize: 13, color: colors.inkSubtle, marginBottom: 4 },
  inner: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: 10,
  },
  innerTitle: { fontSize: 14, fontWeight: "800", color: colors.ink },
  innerBody: { fontSize: 13, color: colors.inkMuted },
  actions: { flexDirection: "row", gap: 10 },
});
