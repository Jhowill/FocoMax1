import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { RootStackParamList } from "@/navigation/types";
import { OnboardingLayout } from "@/screens/onboarding/OnboardingLayout";
import { useOnboarding } from "@/state/OnboardingContext";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingDifficulty">;

const options = ["muito baixo", "baixo", "médio", "alto", "muito alto"];

export function DifficultyScreen({ navigation }: Props) {
  const { data, update } = useOnboarding();
  const { colors } = useTheme();

  return (
    <OnboardingLayout
      title="Nível atual de dificuldade"
      subtitle="Como você avalia sua dificuldade de manter foco hoje?"
      onNext={() => navigation.navigate("OnboardingTarget")}
    >
      <View style={styles.list}>
        {options.map((item) => {
          const active = data.nivelDificuldade === item;
          return (
            <Pressable
              key={item}
              onPress={() => update({ nivelDificuldade: item })}
              style={[
                styles.item,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primarySoft : colors.card
                }
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "600" }}>{item}</Text>
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
