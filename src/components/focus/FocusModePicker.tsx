import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FocusMode } from "@/models/types";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";

const options: Array<{ value: FocusMode; label: string; min: number }> = [
  { value: "pomodoro_classico", label: "Pomodoro clássico", min: 25 },
  { value: "pomodoro_custom", label: "Pomodoro customizado", min: 35 },
  { value: "foco_livre", label: "Foco livre", min: 45 },
  { value: "foco_blocos", label: "Foco em blocos", min: 50 },
  { value: "sessao_rapida", label: "Sessão rápida", min: 15 }
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
                backgroundColor: active ? colors.primarySoft : colors.card
              }
            ]}
            onPress={() => onSelect(option.value, option.min)}
          >
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>{option.label}</Text>
            <Text style={{ color: colors.mutedText, fontSize: 12 }}>{option.min} min sugerido</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  },
  option: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    gap: 2
  }
});
