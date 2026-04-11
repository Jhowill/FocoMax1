import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { SimpleBarChart } from "@/components/common/SimpleBarChart";
import { Segmented } from "@/components/common/Segmented";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getProgressOverview } from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";

type Period = "daily" | "weekly" | "monthly";

export function ProgressOverviewScreen() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof getProgressOverview>>>([]);

  const load = async (p = period) => {
    try {
      setLoading(true);
      setRows(await getProgressOverview(p));
      setError("");
    } catch (err) {
      setError("Erro ao carregar resumo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(period);
  }, [period]);

  if (loading) {
    return <LoadingState message="Montando resumo..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={() => load(period)} />;
  }

  const labels = rows
    .slice()
    .reverse()
    .map((item) => item.label.slice(-5));
  const focusValues = rows
    .slice()
    .reverse()
    .map((item) => item.foco_min ?? 0);

  const latest = rows[0];

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Resumo de progresso</Text>
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { label: "Diário", value: "daily" },
            { label: "Semanal", value: "weekly" },
            { label: "Mensal", value: "monthly" }
          ]}
        />
        <SimpleBarChart labels={labels} values={focusValues} />
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Último período</Text>
        <Text style={{ color: colors.text }}>Foco total: {latest?.foco_min ?? 0} min</Text>
        <Text style={{ color: colors.text }}>Sessões concluídas: {latest?.sessoes_concluidas ?? 0}</Text>
        <Text style={{ color: colors.text }}>Tarefas concluídas: {latest?.tarefas_concluidas ?? 0}</Text>
        <Text style={{ color: colors.text }}>Hábitos concluídos: {latest?.habitos_concluidos ?? 0}</Text>
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
  }
});
