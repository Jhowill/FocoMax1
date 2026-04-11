import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { getAll } from "@/db/database";
import { RootStackParamList } from "@/navigation/types";
import { archiveGoal, getGoalById, removeGoal, setGoalStatus, updateGoalProgressFromTasks } from "@/services/goalService";
import { useTheme } from "@/theme/ThemeProvider";
import { confirmAction } from "@/utils/confirm";
import { formatPtDate } from "@/utils/date";

type Props = NativeStackScreenProps<RootStackParamList, "GoalDetail">;

export function GoalDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goal, setGoal] = useState<Awaited<ReturnType<typeof getGoalById>>>();
  const [tasks, setTasks] = useState<Array<{ id: string; titulo: string; status: string }>>([]);
  const [habits, setHabits] = useState<Array<{ id: string; nome: string }>>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await updateGoalProgressFromTasks(id);
      const [goalData, taskData, habitData] = await Promise.all([
        getGoalById(id),
        getAll<{ id: string; titulo: string; status: string }>(
          "SELECT id, titulo, status FROM tarefas WHERE meta_id = ? AND is_archived = 0 ORDER BY created_at DESC",
          [id]
        ),
        getAll<{ id: string; nome: string }>(
          "SELECT h.id, h.nome FROM habitos h INNER JOIN categorias c ON c.id = h.categoria_id WHERE c.tipo = 'meta' LIMIT 5"
        )
      ]);
      setGoal(goalData);
      setTasks(taskData);
      setHabits(habitData);
      setError("");
    } catch (err) {
      setError("Erro ao abrir meta.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return <LoadingState message="Carregando meta..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }
  if (!goal) {
    return <EmptyState title="Meta não encontrada" description="Esse registro pode ter sido removido." />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>{goal.titulo}</Text>
        <Text style={{ color: colors.mutedText }}>{goal.descricao || "Sem descrição."}</Text>
        <Text style={{ color: colors.text }}>Progresso: {goal.progresso_percentual}%</Text>
        <Text style={{ color: colors.text }}>Prazo: {goal.prazo ? formatPtDate(goal.prazo) : "Não definido"}</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Ações</Text>
        <View style={styles.actions}>
          <AppButton title="Editar" onPress={() => navigation.navigate("GoalEdit", { id })} />
          <AppButton
            title="Concluir meta"
            onPress={async () => {
              await setGoalStatus(id, "concluida");
              await load();
            }}
            variant="secondary"
          />
          <AppButton
            title="Arquivar"
            onPress={() =>
              confirmAction("Arquivar meta", "Você poderá reativar depois.", async () => {
                await archiveGoal(id);
                navigation.goBack();
              })
            }
            variant="secondary"
          />
          <AppButton
            title="Excluir"
            onPress={() =>
              confirmAction("Excluir meta", "A meta será removida permanentemente.", async () => {
                await removeGoal(id);
                navigation.goBack();
              })
            }
            variant="danger"
          />
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Tarefas vinculadas</Text>
        {tasks.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Nenhuma tarefa vinculada.</Text>
        ) : (
          tasks.map((task) => (
            <Text key={task.id} style={{ color: colors.text, fontSize: 12 }}>
              • {task.titulo} ({task.status})
            </Text>
          ))
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Hábitos relacionados</Text>
        {habits.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Nenhum hábito relacionado.</Text>
        ) : (
          habits.map((habit) => (
            <Text key={habit.id} style={{ color: colors.text, fontSize: 12 }}>
              • {habit.nome}
            </Text>
          ))
        )}
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
    fontSize: 20,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "800"
  },
  actions: {
    gap: 8
  }
});
