import { NoiseBackground } from "@/components/ui/NoiseBackground";
import { colors, spacing } from "@/constants/theme";
import { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  children,
  title,
  subtitle,
  right,
  scroll = true,
  style,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) {
  const body = (
    <View style={[styles.content, style]}>
      {(title || right) && (
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <NoiseBackground />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 48 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  headerText: { flex: 1, gap: 4 },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: colors.ink,
    fontFamily: "ArchivoBlack_400Regular",
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
    fontFamily: "SpaceGrotesk_400Regular",
  },
});
