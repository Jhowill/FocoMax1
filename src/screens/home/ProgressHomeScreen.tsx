import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AdBanner } from "@/components/common/AdBanner";
import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { getBehaviorInsights, getProgressOverview } from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/typography";
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
    } catch {
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
      <AppCard tone="premium">
        <Text style={[styles.title, { color: colors.text }]}>Painel de progresso</Text>
        {latest ? (
          <>
            <Text style={[styles.body, { color: colors.text }]}>Foco hoje: {formatDuration(latest.foco_min ?? 0)}</Text>
            <Text style={[styles.body, { color: colors.text }]}>Sessoes concluidas: {latest.sessoes_concluidas ?? 0}</Text>
            <Text style={[styles.body, { color: colors.text }]}>Tarefas concluidas: {latest.tarefas_concluidas ?? 0}</Text>
            <Text style={[styles.body, { color: colors.text }]}>Habitos concluidos: {latest.habitos_concluidos ?? 0}</Text>
          </>
        ) : (
          <EmptyState title="Sem historico" description="Complete sessoes e tarefas para gerar analise." />
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Subabas de analise</Text>
        <View style={styles.actions}>
          <AppButton title="Resumo" onPress={() => navigation.navigate("ProgressOverview")} />
          <AppButton title="Foco" onPress={() => navigation.navigate("ProgressFocus")} variant="secondary" />
          <AppButton title="Tarefas" onPress={() => navigation.navigate("ProgressTasks")} variant="secondary" />
          <AppButton title="Habitos" onPress={() => navigation.navigate("ProgressHabits")} variant="secondary" />
          <AppButton title="Comportamento" onPress={() => navigation.navigate("ProgressBehavior")} variant="secondary" />
        </View>
      </AppCard>

      <AppCard tone="soft">
        <Text style={[styles.title, { color: colors.text }]}>Destaques de comportamento</Text>
        {insights?.topDistractions?.length ? (
          insights.topDistractions.slice(0, 3).map((item) => (
            <Text key={item.motivo} style={[styles.body, { color: colors.text }]}>
              - {item.motivo}: {item.total} ocorrencias
            </Text>
          ))
        ) : (
          <Text style={[styles.body, { color: colors.mutedText }]}>Sem distracoes registradas ainda.</Text>
        )}
      </AppCard>

      <AdBanner placement="progress" onUpgrade={load} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingBottom: 20
  },
  title: {
    ...typography.h4
  },
  body: {
    ...typography.body
  },
  actions: {
    gap: 10
  }
});
