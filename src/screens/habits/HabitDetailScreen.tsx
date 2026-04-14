import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { RootStackParamList } from "@/navigation/types";
import { archiveHabit, getHabitById, getHabitConsistency, listHabitRecords, markHabit, removeHabit } from "@/services/habitService";
import { addHabitCompletion, refreshStreak } from "@/services/statsService";
import { grantXpForHabit } from "@/services/gamificationService";
import { useTheme } from "@/theme/ThemeProvider";
import { confirmAction } from "@/utils/confirm";
import { formatPtDate } from "@/utils/date";

type Props = NativeStackScreenProps<RootStackParamList, "HabitDetail">;

export function HabitDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [habit, setHabit] = useState<Awaited<ReturnType<typeof getHabitById>>>();
  const [records, setRecords] = useState<Awaited<ReturnType<typeof listHabitRecords>>>([]);
  const [consistency, setConsistency] = useState<{ total: number; success: number; rate: number }>({ total: 0, success: 0, rate: 0 });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [habitData, history, consistencyData] = await Promise.all([getHabitById(id), listHabitRecords(id), getHabitConsistency(id)]);
      setHabit(habitData);
      setRecords(history);
      setConsistency(consistencyData);
      setError("");
    } catch {
      setError("Erro ao abrir hábito.");
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
    return <LoadingState message="Carregando hábito..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }
  if (!habit) {
    return <EmptyState title="Hábito não encontrado" description="Esse hábito pode ter sido removido." />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>{habit.nome}</Text>
        <Text style={{ color: colors.mutedText }}>{habit.descricao || "Sem descrição."}</Text>
        <Text style={{ color: colors.text }}>Frequência: {habit.frequencia}</Text>
        <Text style={{ color: colors.text }}>Meta semanal: {habit.meta_semanal ?? 0}</Text>
        <Text style={{ color: colors.text }}>Taxa de consistência: {consistency.rate}%</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Ações</Text>
        <View style={styles.actions}>
          <AppButton title="Editar" onPress={() => navigation.navigate("HabitEdit", { id })} />
          <AppButton
            title="Marcar concluído"
            onPress={async () => {
              await markHabit(id, "concluido");
              await addHabitCompletion();
              await grantXpForHabit();
              await refreshStreak("habito", true);
              await load();
            }}
            variant="secondary"
          />
          <AppButton
            title="Marcar falha"
            onPress={async () => {
              await markHabit(id, "falhou");
              await refreshStreak("habito", false);
              await load();
            }}
            variant="secondary"
          />
          <AppButton
            title="Arquivar"
            onPress={() =>
              confirmAction("Arquivar hábito", "Você poderá reativar depois.", async () => {
                await archiveHabit(id);
                navigation.goBack();
              })
            }
            variant="secondary"
          />
          <AppButton
            title="Excluir"
            onPress={() =>
              confirmAction("Excluir hábito", "Essa ação é permanente.", async () => {
                await removeHabit(id);
                navigation.goBack();
              })
            }
            variant="danger"
          />
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Histórico</Text>
        {records.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Sem registros ainda.</Text>
        ) : (
          records.map((record) => (
            <Text key={record.id} style={{ color: colors.text, fontSize: 12 }}>
              • {formatPtDate(record.data_ref)} - {record.status}
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
