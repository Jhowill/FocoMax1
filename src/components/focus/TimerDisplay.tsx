import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
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
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Text style={[styles.label, { color: colors.mutedText }]}>{label}</Text>
      <Text style={[styles.timer, { color: colors.text }]}>{formatClock(seconds)}</Text>
      <Text style={[styles.meta, { color: colors.mutedText }]}>Interrupções: {interruptions}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.xs
  },
  label: {
    fontSize: 14
  },
  timer: {
    fontSize: 52,
    fontWeight: "800",
    letterSpacing: 1
  },
  meta: {
    fontSize: 12
  }
});
