import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
}

export function AppButton({ title, onPress, variant = "primary", disabled = false, style }: Props) {
  const { colors } = useTheme();

  const colorMap = {
    primary: { background: colors.primary, text: "#FFFFFF", border: colors.primary },
    secondary: { background: colors.primarySoft, text: colors.primary, border: colors.primarySoft },
    danger: { background: colors.danger, text: "#FFFFFF", border: colors.danger },
    ghost: { background: colors.badge, text: colors.text, border: colors.border }
  };

  const palette = colorMap[variant];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }]
        }
      ]}
    >
      <Text style={[styles.label, { color: palette.text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  label: {
    fontSize: 15,
    fontWeight: "700"
  }
});
