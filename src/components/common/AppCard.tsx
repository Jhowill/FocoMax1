import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
import { elevation, radius } from "@/theme/shape";

type CardTone = "default" | "soft" | "premium";

interface Props extends ViewProps {
  tone?: CardTone;
}

export function AppCard({ style, tone = "default", ...props }: Props) {
  const { colors, highContrast } = useTheme();
  const toneStyle =
    tone === "soft"
      ? { backgroundColor: colors.cardSecondary }
      : tone === "premium"
        ? { backgroundColor: colors.surfaceElevated, borderColor: colors.accent, borderWidth: 1.4 }
        : { backgroundColor: colors.card };
  const baseBorderWidth = tone === "premium" ? 1.4 : 1;

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          ...toneStyle,
          borderColor: tone === "premium" ? colors.accent : colors.border,
          borderWidth: highContrast ? 2 : baseBorderWidth,
          shadowColor: colors.shadow,
          ...elevation.md
        },
        style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.2,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md
  }
});
