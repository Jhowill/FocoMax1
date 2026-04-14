import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { listHabits, markHabit, unarchiveHabit } from "@/services/habitService";
import { addHabitCompletion, refreshStreak } from "@/services/statsService";
import { grantXpForHabit } from "@/services/gamificationService";
import { useTheme } from "@/theme/ThemeProvider";

export function HabitListScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [habits, setHabits] = useState<Awaited<ReturnType<typeof listHabits>>>([]);
  const [includeArchived, setIncludeArchived] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setHabits(await listHabits(includeArchived));
      setError("");
    } catch {
      setError("Não foi possível carregar hábitos.");
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
    return <LoadingState message="Carregando hábitos..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Hábitos</Text>
        <AppButton title="Novo hábito" onPress={() => navigation.navigate("HabitNew")} />
        <AppButton
          title={includeArchived ? "Ocultar arquivados" : "Mostrar arquivados"}
          onPress={() => setIncludeArchived((prev) => !prev)}
          variant="ghost"
        />
      </AppCard>

      {habits.length === 0 ? (
        <EmptyState
          title="Nenhum hábito cadastrado"
          description="Crie hábitos para manter consistência diária."
          actionText="Criar hábito"
          onAction={() => navigation.navigate("HabitNew")}
        />
      ) : (
        <AppCard>
          {habits.map((habit) => (
            <Pressable
              key={habit.id}
              style={[styles.item, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate("HabitDetail", { id: habit.id })}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {habit.nome} {habit.is_archived ? "(arquivado)" : ""}
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                {habit.frequencia} • meta semanal {habit.meta_semanal ?? 0}
              </Text>
              <View style={styles.inline}>
                <AppButton
                  title="Concluir hoje"
                  onPress={async () => {
                    await markHabit(habit.id, "concluido");
                    await addHabitCompletion();
                    await grantXpForHabit();
                    await refreshStreak("habito", true);
                    await load();
                  }}
                  variant="secondary"
                />
                <AppButton
                  title="Falhou hoje"
                  onPress={async () => {
                    await markHabit(habit.id, "falhou");
                    await refreshStreak("habito", false);
                    await load();
                  }}
                  variant="secondary"
                />
                {habit.is_archived ? (
                  <AppButton
                    title="Reativar"
                    onPress={async () => {
                      await unarchiveHabit(habit.id);
                      await load();
                    }}
                    variant="secondary"
                  />
                ) : null}
              </View>
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
    gap: 6,
    borderBottomWidth: 1,
    marginBottom: 8,
    paddingBottom: 8
  },
  inline: {
    flexDirection: "row",
    gap: 8
  }
});
