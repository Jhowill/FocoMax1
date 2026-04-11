import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { listCategories } from "@/services/catalogService";
import { listTasks, unarchiveTask } from "@/services/taskService";
import { useTheme } from "@/theme/ThemeProvider";
import { formatPtDate } from "@/utils/date";

type PeriodFilter = "hoje" | "futuras" | "atrasadas" | "todas";
type StatusFilter = "todos" | "pendente" | "em_andamento" | "concluida";

export function TaskListScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof listTasks>>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; nome: string }>>([]);

  const [periodo, setPeriodo] = useState<PeriodFilter>("hoje");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [query, setQuery] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [tag, setTag] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [taskRows, categoryRows] = await Promise.all([
        listTasks({
          periodo,
          status: status === "todos" ? undefined : status,
          categoriaId: categoriaId || undefined,
          tag: tag || undefined,
          query: query || undefined,
          includeArchived
        }),
        listCategories("tarefa")
      ]);
      setTasks(taskRows);
      setCategories(categoryRows);
      setError("");
    } catch (err) {
      setError("Falha ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  }, [periodo, status, categoriaId, tag, query, includeArchived]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return <LoadingState message="Carregando tarefas..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Lista de tarefas</Text>
        <AppInput label="Buscar" value={query} onChangeText={setQuery} placeholder="Buscar por texto" />
        <AppInput label="Tag" value={tag} onChangeText={setTag} placeholder="Ex.: prova" />
        <View style={styles.inlineWrap}>
          {(["hoje", "futuras", "atrasadas", "todas"] as PeriodFilter[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setPeriodo(item)}
              style={[styles.pill, { borderColor: periodo === item ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.inlineWrap}>
          {(["todos", "pendente", "em_andamento", "concluida"] as StatusFilter[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setStatus(item)}
              style={[styles.pill, { borderColor: status === item ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.inlineWrap}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => setCategoriaId((prev) => (prev === category.id ? "" : category.id))}
              style={[styles.pill, { borderColor: categoriaId === category.id ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>{category.nome}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => setIncludeArchived((prev) => !prev)} style={[styles.pill, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontSize: 12 }}>{includeArchived ? "Ocultar arquivadas" : "Mostrar arquivadas"}</Text>
        </Pressable>

        <View style={styles.actions}>
          <AppButton title="Aplicar filtros" onPress={load} />
          <AppButton title="Nova tarefa" onPress={() => navigation.navigate("TaskNew")} variant="secondary" />
        </View>
      </AppCard>

      {tasks.length === 0 ? (
        <EmptyState
          title="Nenhuma tarefa encontrada"
          description="Crie uma tarefa ou ajuste os filtros."
          actionText="Criar tarefa"
          onAction={() => navigation.navigate("TaskNew")}
        />
      ) : (
        <AppCard>
          {tasks.map((task) => (
            <Pressable key={task.id} style={styles.item} onPress={() => navigation.navigate("TaskDetail", { id: task.id })}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {task.titulo} {task.is_archived ? "(arquivada)" : ""}
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                Status: {task.status} • Prioridade {task.prioridade} • {task.data_prevista ? formatPtDate(task.data_prevista) : "sem data"}
              </Text>
              {task.is_archived ? (
                <AppButton
                  title="Reativar"
                  onPress={async () => {
                    await unarchiveTask(task.id);
                    await load();
                  }}
                  variant="secondary"
                />
              ) : null}
            </Pressable>
          ))}
        </AppCard>
      )}
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
  inlineWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 30,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  actions: {
    gap: 8
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.25)",
    paddingBottom: 8,
    marginBottom: 8,
    gap: 2
  }
});
