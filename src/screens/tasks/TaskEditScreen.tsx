import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, LoadingState } from "@/components/common/StateViews";
import { TaskForm } from "@/components/forms/TaskForm";
import { RootStackParamList } from "@/navigation/types";
import { listAreasLife, listCategories } from "@/services/catalogService";
import { listGoals, updateGoalProgressFromTasks } from "@/services/goalService";
import {
  archiveTask,
  duplicateTask,
  getTaskById,
  listTaskSubtasks,
  listTaskTags,
  removeTask,
  setTaskStatus,
  updateTask
} from "@/services/taskService";
import { useTheme } from "@/theme/ThemeProvider";
import { confirmAction } from "@/utils/confirm";

type Props = NativeStackScreenProps<RootStackParamList, "TaskEdit">;

export function TaskEditScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; nome: string }>>([]);
  const [goals, setGoals] = useState<Array<{ id: string; titulo: string }>>([]);
  const [areas, setAreas] = useState<Array<{ id: string; nome: string }>>([]);
  const [initial, setInitial] = useState<any>();

  useEffect(() => {
    Promise.all([getTaskById(id), listTaskSubtasks(id), listTaskTags(id), listCategories("tarefa"), listGoals(), listAreasLife()])
      .then(([task, subtasks, tags, categoryRows, goalRows, areaRows]) => {
        if (task) {
          setInitial({
            ...task,
            subtarefas: subtasks.map((item) => item.titulo),
            tags: tags.map((tag) => tag.nome)
          });
        }
        setCategories(categoryRows);
        setGoals(goalRows);
        setAreas(areaRows);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !initial) {
    return loading ? <LoadingState message="Carregando edição..." /> : <EmptyState title="Tarefa não encontrada" />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Editar tarefa</Text>
        <TaskForm
          initial={initial}
          categories={categories}
          goals={goals}
          areas={areas}
          submitLabel="Salvar alterações"
          onSubmit={async (input) => {
            await updateTask(id, input);
            Alert.alert("Atualizado", "Tarefa atualizada com sucesso.");
            navigation.replace("TaskDetail", { id });
          }}
        />
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Ações adicionais</Text>
        <View style={styles.actions}>
          <AppButton
            title="Concluir"
            onPress={async () => {
              await setTaskStatus(id, "concluida");
              if (initial.meta_id) {
                await updateGoalProgressFromTasks(initial.meta_id);
              }
              navigation.replace("TaskDetail", { id });
            }}
            variant="secondary"
          />
          <AppButton
            title="Duplicar"
            onPress={async () => {
              const newId = await duplicateTask(id);
              if (newId) {
                navigation.replace("TaskDetail", { id: newId });
              }
            }}
            variant="secondary"
          />
          <AppButton
            title="Arquivar"
            onPress={() =>
              confirmAction("Arquivar tarefa", "Você poderá reativar depois.", async () => {
                await archiveTask(id);
                navigation.navigate("Tasks");
              })
            }
            variant="secondary"
          />
          <AppButton
            title="Excluir"
            onPress={() =>
              confirmAction("Excluir tarefa", "Essa ação é permanente.", async () => {
                await removeTask(id);
                navigation.navigate("Tasks");
              })
            }
            variant="danger"
          />
        </View>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12
  },
  title: {
    fontSize: 18,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "800"
  },
  actions: {
    gap: 8
  }
});
