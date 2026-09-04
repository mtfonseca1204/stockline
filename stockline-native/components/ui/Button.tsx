import { colors, glass, radii } from "@/constants/theme";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "soft";

interface Props extends PressableProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = "primary",
  loading,
  disabled,
  style,
  ...props
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.bg : colors.lime} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "primary" && styles.textPrimary,
            variant === "secondary" && styles.textSecondary,
            variant === "ghost" && styles.textGhost,
            variant === "soft" && styles.textSoft,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primary: { backgroundColor: colors.lime },
  secondary: {
    ...glass,
    borderRadius: radii.md,
  },
  ghost: { backgroundColor: "transparent" },
  soft: { backgroundColor: colors.limeSoft },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  text: { fontSize: 15, fontWeight: "700" },
  textPrimary: { color: colors.bg },
  textSecondary: { color: colors.ink },
  textGhost: { color: colors.inkMuted },
  textSoft: { color: colors.lime },
});
