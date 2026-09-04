import { Button } from "@/components/ui/Button";
import { colors, radii, spacing } from "@/constants/theme";
import { ONBOARDING_KEY, ONBOARDING_STEPS } from "@/lib/onboarding";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "1");
    onDone();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <View style={styles.brandRow}>
          <View style={styles.mark}>
            <Text style={styles.markText}>S</Text>
          </View>
          <Text style={styles.brand}>Kora</Text>
        </View>
        <Pressable onPress={finish} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.stepCount}>
          {step + 1} / {ONBOARDING_STEPS.length}
        </Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.copy}>{current.body}</Text>

        <View style={styles.dots}>
          {ONBOARDING_STEPS.map((s, i) => (
            <View
              key={s.id}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {step > 0 ? (
          <Button
            title="Back"
            variant="ghost"
            style={{ flex: 1 }}
            onPress={() => setStep((s) => s - 1)}
          />
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <Button
          title={isLast ? "Get started" : "Next"}
          style={{ flex: 1.4 }}
          onPress={() => {
            if (isLast) finish();
            else setStep((s) => s + 1);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: { fontWeight: "800", color: colors.bg },
  brand: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  skip: { color: colors.inkMuted, fontSize: 14, fontWeight: "600" },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  stepCount: {
    color: colors.lime,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.8,
    lineHeight: 42,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    maxWidth: 320,
  },
  dots: { flexDirection: "row", gap: 8, marginTop: spacing.xl },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.lime,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
  },
});
