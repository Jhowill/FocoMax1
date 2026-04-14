import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FocusMode } from "@/models/types";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

const options: { value: FocusMode; label: string; min: number }[] = [
  { value: "pomodoro_classico", label: "Pomodoro classico", min: 25 },
  { value: "pomodoro_custom", label: "Pomodoro customizado", min: 35 },
  { value: "foco_livre", label: "Foco livre", min: 45 },
  { value: "foco_blocos", label: "Foco em blocos", min: 50 },
  { value: "sessao_rapida", label: "Sessao rapida", min: 15 }
];

export function FocusModePicker({
  selected,
  onSelect
}: {
  selected: FocusMode;
  onSelect: (mode: FocusMode, suggestedMin: number) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.option,
              {
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primarySoft : colors.inputBackground
              }
            ]}
            onPress={() => onSelect(option.value, option.min)}
          >
            <Text style={[styles.title, { color: colors.text }]}>{option.label}</Text>
            <Text style={[styles.meta, { color: colors.mutedText }]}>{option.min} min sugerido</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  option: {
    borderWidth: 1.2,
    borderRadius: radius.lg,
    padding: spacing.mdPlus,
    gap: 4
  },
  title: {
    ...typography.small,
    fontWeight: "700"
  },
  meta: {
    ...typography.caption
  }
});
