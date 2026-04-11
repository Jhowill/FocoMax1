import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { OnboardingLayout } from "@/screens/onboarding/OnboardingLayout";
import { RootStackParamList } from "@/navigation/types";
import { useOnboarding } from "@/state/OnboardingContext";
import { useTheme } from "@/theme/ThemeProvider";
import { MAIN_GOALS } from "@/utils/constants";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingGoal">;

export function GoalScreen({ navigation }: Props) {
  const { data, update } = useOnboarding();
  const { colors } = useTheme();

  return (
    <OnboardingLayout
      title="Seu objetivo principal"
      subtitle="Escolha o foco que mais representa seu momento."
      onNext={() => navigation.navigate("OnboardingDifficulty")}
    >
      <View style={styles.list}>
        {MAIN_GOALS.map((goal) => {
          const active = data.objetivoPrincipal === goal;
          return (
            <Pressable
              key={goal}
              onPress={() => update({ objetivoPrincipal: goal })}
              style={[
                styles.item,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primarySoft : colors.card
                }
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>{goal}</Text>
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
    minHeight: 48,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 14
  }
});
