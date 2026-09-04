import { colors, radii, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function AlertStack() {
  const { alerts, dismissAlert } = useApp();
  if (alerts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      {alerts.slice(0, 2).map((alert) => (
        <View key={alert.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.message}>{alert.message}</Text>
          </View>
          <Pressable onPress={() => dismissAlert(alert.id)} hitSlop={8}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: 90,
    gap: spacing.sm,
    zIndex: 50,
  },
  card: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    elevation: 3,
  },
  title: { fontSize: 14, fontWeight: "700", color: colors.ink },
  message: {
    marginTop: 4,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 17,
  },
  close: { color: colors.inkSubtle, fontSize: 14, padding: 2 },
});
