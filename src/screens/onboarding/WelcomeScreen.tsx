import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { RootStackParamList } from "@/navigation/types";
import { OnboardingLayout } from "@/screens/onboarding/OnboardingLayout";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingWelcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  return (
    <OnboardingLayout
      title="Bem-vindo ao FocoMax"
      subtitle="Planeje melhor, execute com foco e acompanhe sua evolucao diaria com clareza."
      nextLabel="Comecar"
      onNext={() => navigation.navigate("OnboardingGoal")}
      secondaryLabel="Pular"
      onSecondary={() => navigation.navigate("OnboardingFinish")}
    >
      <AppCard tone="premium" style={styles.card}>
        <Text style={[styles.title, { color: colors.text }]}>Fluxo mestre</Text>
        <Text style={[styles.text, { color: colors.mutedText }]}>
          Planejar e executar foco, registrar progresso, analisar desempenho, ajustar rotina e manter consistencia.
        </Text>
      </AppCard>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8
  },
  title: {
    ...typography.h4
  },
  text: {
    ...typography.body
  }
});
