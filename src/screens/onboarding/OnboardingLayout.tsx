import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";

interface Props {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  nextLabel?: string;
  onNext?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function OnboardingLayout({
  title,
  subtitle,
  children,
  nextLabel = "Continuar",
  onNext,
  secondaryLabel,
  onSecondary
}: Props) {
  const { colors } = useTheme();
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.badgeLabel, { color: colors.primary }]}>FocoMax</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>{subtitle}</Text>
      </View>
      <View style={styles.content}>{children}</View>
      <View style={styles.actions}>
        {secondaryLabel && onSecondary ? <AppButton title={secondaryLabel} onPress={onSecondary} variant="secondary" /> : null}
        {onNext ? <AppButton title={nextLabel} onPress={onNext} /> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.md,
    gap: spacing.xs
  },
  badge: {
    alignSelf: "flex-start",
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    justifyContent: "center"
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  title: {
    fontSize: 32,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22
  },
  content: {
    flex: 1,
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.md
  }
});
