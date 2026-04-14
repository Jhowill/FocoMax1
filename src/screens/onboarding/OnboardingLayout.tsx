import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

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
        <View style={[styles.badge, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
          <Text style={[styles.badgeLabel, { color: colors.accent }]}>FocoMax</Text>
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
    gap: spacing.sm
  },
  badge: {
    alignSelf: "flex-start",
    minHeight: 34,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.mdPlus,
    justifyContent: "center"
  },
  badgeLabel: {
    ...typography.overline
  },
  title: {
    ...typography.h1
  },
  subtitle: {
    ...typography.body
  },
  content: {
    flex: 1,
    gap: spacing.md,
    marginTop: spacing.sm
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.md
  }
});
