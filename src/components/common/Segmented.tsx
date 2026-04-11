import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";

export function Segmented<T extends string>({
  value,
  options,
  onChange
}: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}>
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
                    backgroundColor: colors.primary
                  }
                : null
            ]}
          >
            <Text style={{ color: active ? "#FFFFFF" : colors.text, fontSize: 12, fontWeight: "600" }}>
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
    borderWidth: 1,
    borderRadius: 12,
    padding: 3
  },
  item: {
    flex: 1,
    minHeight: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  }
});
