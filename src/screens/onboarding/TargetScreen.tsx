import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";

import { AppInput } from "@/components/common/AppInput";
import { RootStackParamList } from "@/navigation/types";
import { OnboardingLayout } from "@/screens/onboarding/OnboardingLayout";
import { useOnboarding } from "@/state/OnboardingContext";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingTarget">;

export function TargetScreen({ navigation }: Props) {
  const { data, update } = useOnboarding();
  const [focoDia, setFocoDia] = useState(`${data.metaFocoDia}`);
  const [tarefasDia, setTarefasDia] = useState(`${data.metaTarefasDia}`);
  const [habito, setHabito] = useState(data.habitoPrincipal);

  return (
    <OnboardingLayout
      title="Defina sua meta inicial"
      subtitle="Esses valores podem ser editados depois nas configurações."
      onNext={() => {
        update({
          metaFocoDia: Number(focoDia) || 30,
          metaTarefasDia: Number(tarefasDia) || 2,
          habitoPrincipal: habito || "Planejar o dia"
        });
        navigation.navigate("OnboardingTheme");
      }}
    >
      <AppInput label="Minutos de foco por dia" value={focoDia} onChangeText={setFocoDia} keyboardType="numeric" />
      <AppInput label="Tarefas concluídas por dia" value={tarefasDia} onChangeText={setTarefasDia} keyboardType="numeric" />
      <AppInput label="Hábito principal" value={habito} onChangeText={setHabito} placeholder="Ex.: Revisar metas do dia" />
    </OnboardingLayout>
  );
}
