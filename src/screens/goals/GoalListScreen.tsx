import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { listGoals, unarchiveGoal } from "@/services/goalService";
import { useTheme } from "@/theme/ThemeProvider";

export function GoalListScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goals, setGoals] = useState<Awaited<ReturnType<typeof listGoals>>>([]);
  const [includeArchived, setIncludeArchived] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setGoals(await listGoals(includeArchived));
      setError("");
    } catch {
      setError("Erro ao carregar metas.");
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return <LoadingState message="Carregando metas..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Metas</Text>
        <AppButton title="Nova meta" onPress={() => navigation.navigate("GoalNew")} />
        <AppButton
          title={includeArchived ? "Ocultar arquivadas" : "Mostrar arquivadas"}
          onPress={() => setIncludeArchived((prev) => !prev)}
          variant="ghost"
        />
      </AppCard>

      {goals.length === 0 ? (
        <EmptyState title="Nenhuma meta cadastrada" description="Crie metas para conectar tarefas e hábitos." actionText="Criar meta" onAction={() => navigation.navigate("GoalNew")} />
      ) : (
        <AppCard>
          {goals.map((goal) => (
            <Pressable
              key={goal.id}
              style={[styles.item, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate("GoalDetail", { id: goal.id })}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {goal.titulo} {goal.is_archived ? "(arquivada)" : ""}
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                Progresso: {goal.progresso_percentual}% • Status: {goal.status}
              </Text>
              {goal.is_archived ? (
                <AppButton
                  title="Reativar"
                  onPress={async () => {
                    await unarchiveGoal(goal.id);
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
  item: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
    gap: 2
  }
});
