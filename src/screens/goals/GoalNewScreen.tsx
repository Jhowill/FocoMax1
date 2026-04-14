import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { LoadingState } from "@/components/common/StateViews";
import { GoalForm } from "@/components/forms/GoalForm";
import { RootStackParamList } from "@/navigation/types";
import { listAreasLife } from "@/services/catalogService";
import { createGoal } from "@/services/goalService";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "GoalNew">;

export function GoalNewScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [areas, setAreas] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAreasLife()
      .then(setAreas)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Carregando formulário..." />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Criar meta</Text>
        <GoalForm
          areas={areas}
          onSubmit={async (input) => {
            const id = await createGoal(input);
            Alert.alert("Meta criada", "Sua meta foi salva com sucesso.");
            navigation.replace("GoalDetail", { id });
          }}
        />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: "800"
  }
});
