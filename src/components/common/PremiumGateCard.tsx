import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { useRootNavigation } from "@/navigation/hooks";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

export function PremiumGateCard({
  title = "Recurso Premium",
  description,
  cta = "Conhecer Premium"
}: {
  title?: string;
  description: string;
  cta?: string;
}) {
  const { colors } = useTheme();
  const navigation = useRootNavigation();

  return (
    <AppCard tone="premium" style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedText }]}>{description}</Text>
      <View style={styles.cta}>
        <AppButton title={cta} onPress={() => navigation.navigate("Premium")} variant="primary" />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderStyle: "dashed",
    borderRadius: radius.xl
  },
  title: {
    ...typography.h4
  },
  description: {
    ...typography.small
  },
  cta: {
    marginTop: 4
  }
});
