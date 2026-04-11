import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { RootStackParamList } from "@/navigation/types";
import { OnboardingLayout } from "@/screens/onboarding/OnboardingLayout";
import { useOnboarding } from "@/state/OnboardingContext";
import { ThemeMode } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingTheme">;

const options: Array<{ label: string; value: ThemeMode }> = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Automático", value: "auto" }
];

export function ThemeScreen({ navigation }: Props) {
  const { data, update } = useOnboarding();
  const { colors } = useTheme();

  return (
    <OnboardingLayout
      title="Escolha o estilo visual"
      subtitle="Você pode trocar o tema quando quiser."
      onNext={() => navigation.navigate("OnboardingMode")}
    >
      <View style={styles.list}>
        {options.map((option) => {
          const active = data.tema === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => update({ tema: option.value })}
              style={[
                styles.item,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primarySoft : colors.card
                }
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>{option.label}</Text>
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
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 14
  }
});
