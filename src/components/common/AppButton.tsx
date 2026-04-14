import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
import { elevation, radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "info";

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({ title, onPress, variant = "primary", disabled = false, style }: Props) {
  const { colors, largeTouchTargets } = useTheme();

  const colorMap = {
    primary: {
      background: colors.primary,
      text: colors.textOnPrimary,
      border: colors.primary,
      borderWidth: 0,
      shadow: true
    },
    secondary: {
      background: "transparent",
      text: colors.primary,
      border: colors.primary,
      borderWidth: 1.4,
      shadow: false
    },
    danger: {
      background: colors.danger,
      text: "#FFFFFF",
      border: colors.danger,
      borderWidth: 0,
      shadow: true
    },
    ghost: {
      background: "transparent",
      text: colors.mutedText,
      border: "transparent",
      borderWidth: 0,
      shadow: false
    },
    info: {
      background: colors.primarySoft,
      text: colors.text,
      border: "transparent",
      borderWidth: 0,
      shadow: false
    }
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
          minHeight: largeTouchTargets ? 56 : spacing.touch,
          paddingHorizontal: largeTouchTargets ? spacing.lg : spacing.mdPlus,
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: palette.borderWidth,
          shadowColor: colors.shadow,
          ...(palette.shadow ? elevation.md : elevation.none),
          opacity: disabled ? 0.48 : pressed ? 0.93 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }]
        }
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: palette.text,
            fontSize: largeTouchTargets ? 16 : 15
          }
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm
  },
  label: {
    ...typography.button,
    textTransform: "none"
  }
});
