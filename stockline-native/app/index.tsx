import { Onboarding } from "@/components/Onboarding";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { WalletModal } from "@/components/WalletModal";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { ONBOARDING_KEY } from "@/lib/onboarding";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandingScreen() {
  const { enableDemoMode, connected, hasPosition } = useApp();
  const [walletOpen, setWalletOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      setShowOnboarding(v !== "1");
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (connected && hasPosition) router.replace("/(tabs)/dashboard");
  }, [connected, hasPosition]);

  const afterConnect = (position: boolean) => {
    if (position || hasPosition) router.replace("/(tabs)/dashboard");
    else router.replace("/empty");
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.lime} />
      </View>
    );
  }

  if (showOnboarding) {
    return <Onboarding onDone={() => setShowOnboarding(false)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.glow} pointerEvents="none" />
      <View style={styles.top}>
        <View style={styles.brand}>
          <View style={styles.mark}>
            <Text style={styles.markText}>S</Text>
          </View>
          <Text style={styles.logo}>Stockline</Text>
        </View>
        <Badge label="Base" tone="lime" />
      </View>

      <View style={styles.hero}>
        <Text style={styles.headline}>
          Borrow against stocks.{"\n"}Keep them invested.
        </Text>
        <Text style={styles.sub}>
          Deposit tokenized stocks, borrow USDC, and let yield help repay your
          loan.
        </Text>
      </View>

      <Card style={styles.preview}>
        <Text style={styles.previewLabel}>Net worth</Text>
        <Text style={styles.previewValue}>$25,480</Text>
        <View style={styles.previewRow}>
          <Text style={styles.previewMuted}>Available</Text>
          <Text style={styles.previewAccent}>$10,014</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewMuted}>Debt</Text>
          <Text style={styles.previewInk}>$4,000</Text>
        </View>
      </Card>

      <View style={styles.footer}>
        <Button title="Start borrowing" onPress={() => setWalletOpen(true)} />
        <Pressable
          onPress={() => {
            enableDemoMode();
            router.replace("/(tabs)/dashboard");
          }}
        >
          <Text style={styles.demo}>Enter Demo Mode</Text>
        </Pressable>
      </View>

      <WalletModal
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        onConnected={afterConnect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  glow: {
    position: "absolute",
    top: -60,
    left: "5%",
    right: "5%",
    height: 240,
    borderRadius: 200,
    backgroundColor: "rgba(184,240,0,0.1)",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: { fontWeight: "800", color: colors.bg },
  logo: { fontSize: 16, fontWeight: "700", color: colors.ink },
  hero: { flex: 1, justifyContent: "center", gap: 14 },
  headline: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  sub: { fontSize: 15, color: colors.inkMuted, lineHeight: 22 },
  preview: { padding: spacing.xl, gap: 10, marginBottom: spacing.xl },
  previewLabel: { fontSize: 13, color: colors.inkMuted },
  previewValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -1,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  previewMuted: { color: colors.inkMuted, fontSize: 14 },
  previewAccent: { color: colors.lime, fontSize: 14, fontWeight: "700" },
  previewInk: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  footer: { gap: 14 },
  demo: {
    textAlign: "center",
    color: colors.inkMuted,
    fontWeight: "600",
    fontSize: 14,
  },
});
