import { Badge, Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { StyleSheet, Text, View } from "react-native";

export default function ActivityScreen() {
  const { activities } = useApp();

  return (
    <Screen title="Activity" subtitle="Recent transactions">
      {activities.length === 0 ? (
        <Card style={styles.empty}>
          <Text style={styles.emptyText}>No activity yet.</Text>
        </Card>
      ) : (
        <Card style={styles.list}>
          {activities.slice(0, 12).map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.meta}>
                  {item.date} · {item.amount}
                </Text>
              </View>
              <Badge
                label={
                  item.status === "confirmed"
                    ? "Done"
                    : item.status === "pending"
                      ? "Pending"
                      : "Failed"
                }
                tone={
                  item.status === "confirmed"
                    ? "green"
                    : item.status === "pending"
                      ? "amber"
                      : "red"
                }
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { padding: spacing.xxl },
  emptyText: { textAlign: "center", color: colors.inkMuted },
  list: { overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { fontSize: 14, fontWeight: "600", color: colors.ink },
  meta: { marginTop: 3, fontSize: 12, color: colors.inkMuted },
});
