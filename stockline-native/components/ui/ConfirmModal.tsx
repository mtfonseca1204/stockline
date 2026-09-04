import { Button } from "@/components/ui/Button";
import { colors, glassStrong, radii, spacing } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  details,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading,
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  details?: Array<{ label: string; value: string }>;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={() => !loading && onClose()}>
        <Pressable style={styles.sheetWrap} onPress={(e) => e.stopPropagation()}>
          <BlurView intensity={40} tint="dark" style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>
            {description ? (
              <Text style={styles.desc}>{description}</Text>
            ) : null}

            {details && details.length > 0 ? (
              <View style={styles.details}>
                {details.map((d) => (
                  <View key={d.label} style={styles.row}>
                    <Text style={styles.rowLabel}>{d.label}</Text>
                    <Text style={styles.rowValue}>{d.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.actions}>
              <Button
                title={cancelLabel}
                variant="secondary"
                style={{ flex: 1 }}
                disabled={loading}
                onPress={onClose}
              />
              <Button
                title={loading ? "Working…" : confirmLabel}
                style={{
                  flex: 1,
                  ...(danger ? { backgroundColor: colors.danger } : {}),
                }}
                disabled={loading}
                onPress={onConfirm}
              />
            </View>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheetWrap: {
    padding: spacing.lg,
    paddingBottom: 28,
  },
  sheet: {
    ...glassStrong,
    overflow: "hidden",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.ink },
  desc: { fontSize: 14, color: colors.inkMuted, lineHeight: 20 },
  details: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 13, color: colors.inkMuted },
  rowValue: { fontSize: 13, fontWeight: "700", color: colors.ink },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
});
