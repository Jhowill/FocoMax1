import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function AppInput({ label, error, ...props }: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.mutedText }]}>{label}</Text>
      <TextInput
        {...props}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
            color: colors.text
          },
          props.multiline ? styles.multiline : null
        ]}
        placeholderTextColor={colors.mutedText}
      />
      {!!error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  },
  label: {
    fontSize: 14,
    fontWeight: "600"
  },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15
  },
  multiline: {
    minHeight: 110,
    paddingVertical: spacing.sm,
    textAlignVertical: "top"
  },
  error: {
    fontSize: 12,
    fontWeight: "500"
  }
});
