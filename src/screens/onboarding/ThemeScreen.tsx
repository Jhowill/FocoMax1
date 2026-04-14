import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { RootStackParamList } from "@/navigation/types";
import { OnboardingLayout } from "@/screens/onboarding/OnboardingLayout";
import { useOnboarding } from "@/state/OnboardingContext";
import { ThemeMode } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingTheme">;

const options: { label: string; value: ThemeMode }[] = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Automatico", value: "auto" }
];

export function ThemeScreen({ navigation }: Props) {
  const { data, update } = useOnboarding();
  const { colors } = useTheme();

  return (
    <OnboardingLayout
      title="Escolha o estilo visual"
      subtitle="Voce pode trocar o tema quando quiser."
      onNext={() => navigation.navigate("OnboardingMode")}
    >
      <AppCard>
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
                    backgroundColor: active ? colors.primarySoft : colors.inputBackground
                  }
                ]}
              >
                <Text style={[styles.itemLabel, { color: colors.text }]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </AppCard>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10
  },
  item: {
    borderWidth: 1.2,
    borderRadius: radius.lg,
    minHeight: 50,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  itemLabel: {
    ...typography.subtitle
  }
});
