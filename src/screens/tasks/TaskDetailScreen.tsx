import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { getAll } from "@/db/database";
import { RootStackParamList } from "@/navigation/types";
import { updateGoalProgressFromTasks } from "@/services/goalService";
import { archiveTask, duplicateTask, getTaskById, listTaskSubtasks, removeTask, setTaskStatus } from "@/services/taskService";
import { addTaskCompletion } from "@/services/statsService";
import { grantXpForTask } from "@/services/gamificationService";
import { useTheme } from "@/theme/ThemeProvider";
import { confirmAction } from "@/utils/confirm";
import { formatPtDateTime } from "@/utils/date";

type Props = NativeStackScreenProps<RootStackParamList, "TaskDetail">;

export function TaskDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [task, setTask] = useState<Awaited<ReturnType<typeof getTaskById>>>();
  const [subtasks, setSubtasks] = useState<Awaited<ReturnType<typeof listTaskSubtasks>>>([]);
  const [sessions, setSessions] = useState<{ id: string; status: string; started_at: string; duracao_real_segundos: number }[]>([]);
  const [history, setHistory] = useState<{ id: string; acao: string; created_at: string }[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [taskData, subtaskData, sessionData, historyData] = await Promise.all([
        getTaskById(id),
        listTaskSubtasks(id),
        getAll<{ id: string; status: string; started_at: string; duracao_real_segundos: number }>(
          "SELECT id, status, started_at, duracao_real_segundos FROM sessoes_foco WHERE tarefa_id = ? ORDER BY started_at DESC LIMIT 10",
          [id]
        ),
        getAll<{ id: string; acao: string; created_at: string }>(
          "SELECT id, acao, created_at FROM historico_acao WHERE entidade = 'tarefas' AND entidade_id = ? ORDER BY created_at DESC LIMIT 12",
          [id]
        )
      ]);
      setTask(taskData);
      setSubtasks(subtaskData);
      setSessions(sessionData);
      setHistory(historyData);
      setError("");
    } catch {
      setError("Falha ao carregar detalhes da tarefa.");
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
    return <LoadingState message="Abrindo tarefa..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }
  if (!task) {
    return <EmptyState title="Tarefa não encontrada" description="Esse item pode ter sido removido." />;
  }

  const completeTask = async () => {
    if (task.status === "concluida") {
      Alert.alert("Já concluída", "Essa tarefa já está marcada como concluída.");
      return;
    }
    await setTaskStatus(task.id, "concluida");
    if (task.meta_id) {
      await updateGoalProgressFromTasks(task.meta_id);
    }
    await addTaskCompletion();
    await grantXpForTask();
    Alert.alert("Concluída", "Tarefa marcada como concluída.");
    await load();
  };

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>{task.titulo}</Text>
        <Text style={{ color: colors.mutedText }}>{task.descricao || "Sem descrição."}</Text>
        <Text style={{ color: colors.text }}>Status: {task.status}</Text>
        <Text style={{ color: colors.text }}>Prioridade: {task.prioridade}</Text>
        <Text style={{ color: colors.text }}>Data prevista: {task.data_prevista ?? "Não definida"}</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Ações</Text>
        <View style={styles.actions}>
          <AppButton title="Editar" onPress={() => navigation.navigate("TaskEdit", { id: task.id })} />
          <AppButton title="Iniciar foco nessa tarefa" onPress={() => navigation.navigate("FocusSession", { taskId: task.id })} variant="secondary" />
          <AppButton title="Concluir" onPress={completeTask} variant="secondary" />
          <AppButton
            title="Duplicar"
            onPress={async () => {
              const newId = await duplicateTask(task.id);
              if (newId) {
                navigation.navigate("TaskDetail", { id: newId });
              }
            }}
            variant="secondary"
          />
          <AppButton
            title="Arquivar"
            onPress={() =>
              confirmAction("Arquivar tarefa", "Você pode reativar depois no histórico.", async () => {
                await archiveTask(task.id);
                navigation.goBack();
              })
            }
            variant="secondary"
          />
          <AppButton
            title="Excluir"
            onPress={() =>
              confirmAction("Excluir tarefa", "Essa ação remove a tarefa e subtarefas permanentemente.", async () => {
                await removeTask(task.id);
                navigation.goBack();
              })
            }
            variant="danger"
          />
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Subtarefas</Text>
        {subtasks.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Sem subtarefas.</Text>
        ) : (
          subtasks.map((sub) => (
            <Text key={sub.id} style={{ color: colors.text }}>
              • {sub.titulo} {sub.concluida ? "(ok)" : ""}
            </Text>
          ))
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Sessões de foco associadas</Text>
        {sessions.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Nenhuma sessão vinculada.</Text>
        ) : (
          sessions.map((session) => (
            <Text key={session.id} style={{ color: colors.text, fontSize: 12 }}>
              • {formatPtDateTime(session.started_at)} • {session.status} • {Math.round(session.duracao_real_segundos / 60)} min
            </Text>
          ))
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Histórico</Text>
        {history.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Sem histórico registrado.</Text>
        ) : (
          history.map((entry) => (
            <Text key={entry.id} style={{ color: colors.text, fontSize: 12 }}>
              • {entry.acao} em {formatPtDateTime(entry.created_at)}
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
