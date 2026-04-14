import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
import { elevation, radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

export function LoadingState({ message = "Carregando..." }: { message?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.text, { color: colors.mutedText }]}>{message}</Text>
    </View>
  );
}

export function EmptyState({
  title = "Sem dados",
  description = "Adicione seu primeiro registro para comecar.",
  actionText,
  onAction
}: {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="sunny-outline" size={24} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.text, { color: colors.mutedText }]}>{description}</Text>
      {actionText && onAction ? <AppButton title={actionText} onPress={onAction} /> : null}
    </View>
  );
}

export function ErrorState({
  message = "Ocorreu um erro inesperado.",
  onRetry
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
      <Text style={[styles.title, { color: colors.danger }]}>Algo deu errado</Text>
      <Text style={[styles.text, { color: colors.mutedText }]}>{message}</Text>
      {onRetry ? <AppButton title="Tentar novamente" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.2,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...elevation.sm
  },
  title: {
    ...typography.h4,
    textAlign: "center"
  },
  text: {
    ...typography.body,
    textAlign: "center"
  }
});
