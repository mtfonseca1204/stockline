import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, radii, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EmptyScreen() {
  const { enableDemoMode, connected } = useApp();

  useEffect(() => {
    if (!connected) router.replace("/");
  }, [connected]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Supply collateral</Text>
        <Text style={styles.desc}>
          Deposit tokenized stocks to unlock a credit line.
        </Text>
        <Button title="Deposit stocks" onPress={() => router.push("/deposit")} />
        <Card style={styles.demo}>
          <Text style={styles.demoTitle}>Need a filled demo?</Text>
          <Button
            title="Enter Demo Mode"
            variant="soft"
            onPress={() => {
              enableDemoMode();
              router.replace("/(tabs)/dashboard");
            }}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    padding: spacing.xxl,
    justifyContent: "center",
    gap: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.6,
  },
  desc: { fontSize: 15, color: colors.inkMuted, lineHeight: 22, marginBottom: 8 },
  demo: { marginTop: 16, padding: spacing.lg, gap: 12 },
  demoTitle: { fontSize: 14, fontWeight: "600", color: colors.inkMuted },
});
