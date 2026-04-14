import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { LoadingState } from "@/components/common/StateViews";
import { GoalForm } from "@/components/forms/GoalForm";
import { RootStackParamList } from "@/navigation/types";
import { listAreasLife } from "@/services/catalogService";
import { getGoalById, updateGoal } from "@/services/goalService";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "GoalEdit">;

export function GoalEditScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<{ id: string; nome: string }[]>([]);
  const [initial, setInitial] = useState<any>();

  useEffect(() => {
    Promise.all([getGoalById(id), listAreasLife()])
      .then(([goal, areaRows]) => {
        setInitial(goal);
        setAreas(areaRows);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !initial) {
    return <LoadingState message="Carregando edição..." />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Editar meta</Text>
        <GoalForm
          initial={initial}
          areas={areas}
          submitLabel="Salvar alterações"
          onSubmit={async (input) => {
            await updateGoal(id, input);
            Alert.alert("Atualizado", "Meta atualizada.");
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
