import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { LoadingState } from "@/components/common/StateViews";
import { TaskForm } from "@/components/forms/TaskForm";
import { RootStackParamList } from "@/navigation/types";
import { listAreasLife, listCategories } from "@/services/catalogService";
import { listGoals } from "@/services/goalService";
import { createTask } from "@/services/taskService";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "TaskNew">;

export function TaskNewScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; nome: string }>>([]);
  const [goals, setGoals] = useState<Array<{ id: string; titulo: string }>>([]);
  const [areas, setAreas] = useState<Array<{ id: string; nome: string }>>([]);

  useEffect(() => {
    Promise.all([listCategories("tarefa"), listGoals(), listAreasLife()])
      .then(([cat, goal, area]) => {
        setCategories(cat);
        setGoals(goal);
        setAreas(area);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Preparando formulário..." />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Criar tarefa</Text>
        <TaskForm
          categories={categories}
          goals={goals}
          areas={areas}
          onSubmit={async (input) => {
            const id = await createTask(input);
            Alert.alert("Tarefa criada", "Sua tarefa foi salva com sucesso.");
            navigation.replace("TaskDetail", { id });
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
