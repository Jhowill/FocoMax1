import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

export function Segmented<T extends string>({
  value,
  options,
  onChange
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.cardSecondary }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.item,
              active
                ? {
                    backgroundColor: colors.primary,
                    shadowColor: colors.shadow,
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 2
                  }
                : null
            ]}
          >
            <Text style={[styles.label, { color: active ? colors.textOnPrimary : colors.text }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderWidth: 1.2,
    borderRadius: radius.lg,
    padding: spacing.xxs,
    gap: spacing.xxs
  },
  item: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    ...typography.caption
  }
});
