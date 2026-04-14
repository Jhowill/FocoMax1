import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
import { elevation, radius } from "@/theme/shape";
import { typography } from "@/theme/typography";
import { formatClock } from "@/utils/date";

export function TimerDisplay({
  seconds,
  label,
  interruptions
}: {
  seconds: number;
  label: string;
  interruptions: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.cardSecondary }]}>
      <Text style={[styles.label, { color: colors.mutedText }]}>{label}</Text>
      <Text style={[styles.timer, { color: colors.text }]}>{formatClock(seconds)}</Text>
      <Text style={[styles.meta, { color: colors.mutedText }]}>Interrupcoes: {interruptions}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.2,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    ...elevation.md
  },
  label: {
    ...typography.overline,
    textAlign: "center"
  },
  timer: {
    fontSize: 58,
    fontWeight: "800",
    letterSpacing: 2
  },
  meta: {
    ...typography.caption
  }
});
