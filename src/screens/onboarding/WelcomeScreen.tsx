import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { OnboardingLayout } from "@/screens/onboarding/OnboardingLayout";
import { RootStackParamList } from "@/navigation/types";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingWelcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  return (
    <OnboardingLayout
      title="Bem-vindo ao FocoMax"
      subtitle="Planeje melhor, execute com foco e acompanhe sua evolução diária com clareza."
      nextLabel="Começar"
      onNext={() => navigation.navigate("OnboardingGoal")}
      secondaryLabel="Pular"
      onSecondary={() => navigation.navigate("OnboardingFinish")}
    >
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Fluxo mestre</Text>
        <Text style={[styles.text, { color: colors.mutedText }]}>
          Planejar → Executar foco → Registrar progresso → Analisar desempenho → Ajustar rotina → Manter consistência.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: "800"
  },
  text: {
    fontSize: 14,
    lineHeight: 20
  }
});
