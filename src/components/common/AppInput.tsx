import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function AppInput({ label, error, ...props }: Props) {
  const { colors, largeTouchTargets } = useTheme();
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
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
            color: colors.text,
            minHeight: largeTouchTargets ? 56 : spacing.touch,
            fontSize: largeTouchTargets ? 16 : 15,
            shadowColor: colors.shadow,
            shadowOpacity: focused ? 0.12 : 0.05,
            shadowRadius: focused ? 12 : 6,
            shadowOffset: { width: 0, height: focused ? 4 : 2 },
            elevation: focused ? 4 : 1
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
    ...typography.overline
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.2,
    paddingHorizontal: spacing.mdPlus,
    fontSize: 15,
    letterSpacing: 0.3
  },
  multiline: {
    minHeight: 120,
    paddingVertical: spacing.sm,
    textAlignVertical: "top"
  },
  error: {
    ...typography.caption
  }
});
