import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { RootStackParamList } from "@/navigation/types";
import { OnboardingLayout } from "@/screens/onboarding/OnboardingLayout";
import { useOnboarding } from "@/state/OnboardingContext";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingMode">;

const options = [
  { key: "iniciante", desc: "Ritmo leve e suporte guiado." },
  { key: "equilibrado", desc: "Produtividade estável com flexibilidade." },
  { key: "intenso", desc: "Alto compromisso e sessões maiores." }
] as const;

export function ModeScreen({ navigation }: Props) {
  const { data, update } = useOnboarding();
  const { colors } = useTheme();

  return (
    <OnboardingLayout
      title="Escolha seu modo inicial"
      subtitle="Isso ajusta sugestões, metas e ritmo de foco."
      onNext={() => navigation.navigate("OnboardingFinish")}
    >
      <View style={styles.list}>
        {options.map((option) => {
          const active = data.modoUso === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => update({ modoUso: option.key })}
              style={[
                styles.item,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primarySoft : colors.card
                }
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>{option.key}</Text>
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>{option.desc}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10
  },
  item: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 14,
    gap: 2
  }
});
