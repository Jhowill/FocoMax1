import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AdBanner } from "@/components/common/AdBanner";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { getBehaviorInsights, getProgressOverview } from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";
import { formatDuration } from "@/utils/date";

export function ProgressHomeScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getProgressOverview>>>([]);
  const [insights, setInsights] = useState<Awaited<ReturnType<typeof getBehaviorInsights>>>();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, behavior] = await Promise.all([getProgressOverview("daily"), getBehaviorInsights()]);
      setOverview(summary);
      setInsights(behavior);
      setError("");
    } catch (err) {
      setError("Erro ao carregar progresso.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return <LoadingState message="Analisando seu desempenho..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const latest = overview[0];

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Painel de progresso</Text>
        {latest ? (
          <>
            <Text style={{ color: colors.text }}>Foco hoje: {formatDuration(latest.foco_min ?? 0)}</Text>
            <Text style={{ color: colors.text }}>Sessões concluídas: {latest.sessoes_concluidas ?? 0}</Text>
            <Text style={{ color: colors.text }}>Tarefas concluídas: {latest.tarefas_concluidas ?? 0}</Text>
            <Text style={{ color: colors.text }}>Hábitos concluídos: {latest.habitos_concluidos ?? 0}</Text>
          </>
        ) : (
          <EmptyState title="Sem histórico" description="Complete sessões e tarefas para gerar análise." />
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Subabas de análise</Text>
        <View style={styles.actions}>
          <AppButton title="Resumo" onPress={() => navigation.navigate("ProgressOverview")} />
          <AppButton title="Foco" onPress={() => navigation.navigate("ProgressFocus")} variant="secondary" />
          <AppButton title="Tarefas" onPress={() => navigation.navigate("ProgressTasks")} variant="secondary" />
          <AppButton title="Hábitos" onPress={() => navigation.navigate("ProgressHabits")} variant="secondary" />
          <AppButton title="Comportamento" onPress={() => navigation.navigate("ProgressBehavior")} variant="secondary" />
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Destaques de comportamento</Text>
        {insights?.topDistractions?.length ? (
          insights.topDistractions.slice(0, 3).map((item) => (
            <Text key={item.motivo} style={{ color: colors.text }}>
              • {item.motivo}: {item.total} ocorrências
            </Text>
          ))
        ) : (
          <Text style={{ color: colors.mutedText }}>Sem distrações registradas ainda.</Text>
        )}
      </AppCard>

      <AdBanner placement="progress" onUpgrade={load} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    paddingBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: "800"
  },
  actions: {
    gap: 8
  }
});
