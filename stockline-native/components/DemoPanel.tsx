import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { StyleSheet, Text, View } from "react-native";

export function DemoPanel() {
  const { demoMode, simulateGrowth, simulateYield, enableDemoMode, resetToEmpty } =
    useApp();

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Demo</Text>
      {!demoMode ? (
        <Button title="Load demo" variant="soft" onPress={enableDemoMode} />
      ) : (
        <View style={styles.row}>
          <Button
            title="+10%"
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => simulateGrowth(0.1)}
          />
          <Button
            title="+$100 yield"
            style={{ flex: 1 }}
            onPress={() => simulateYield(100)}
          />
          <Button
            title="Reset"
            variant="ghost"
            style={{ flex: 1 }}
            onPress={resetToEmpty}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: 10,
    borderColor: colors.lime,
    backgroundColor: colors.limeSoft,
  },
  title: { fontSize: 13, fontWeight: "700", color: colors.lime },
  row: { flexDirection: "row", gap: 8 },
});
