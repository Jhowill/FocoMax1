import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { SimpleBarChart } from "@/components/common/SimpleBarChart";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getFocusAnalytics } from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";

export function ProgressFocusScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof getFocusAnalytics>>>();

  const load = async () => {
    try {
      setLoading(true);
      setData(await getFocusAnalytics());
      setError("");
    } catch {
      setError("Erro ao carregar análise de foco.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingState message="Analisando sessões..." />;
  }
  if (error || !data) {
    return <ErrorState message={error || "Sem dados"} onRetry={load} />;
  }

  const modeLabels = data.byMode.map((item) => item.modo.slice(0, 6));
  const modeValues = data.byMode.map((item) => Math.round(item.minutos ?? 0));

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Foco</Text>
        <Text style={{ color: colors.text }}>Sessões concluídas: {data.totals?.total_sessoes ?? 0}</Text>
        <Text style={{ color: colors.text }}>Tempo total: {Math.round(data.totals?.total_min ?? 0)} min</Text>
        <Text style={{ color: colors.text }}>Sessões interrompidas: {data.totals?.interrompidas ?? 0}</Text>
        <Text style={{ color: colors.text }}>Duração média: {Math.round(data.totals?.media_min ?? 0)} min</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Tempo por modo</Text>
        <SimpleBarChart labels={modeLabels} values={modeValues} />
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Tempo por categoria</Text>
        {data.byTaskCategory.map((item) => (
          <Text key={item.categoria} style={{ color: colors.text, fontSize: 12 }}>
            • {item.categoria}: {Math.round(item.minutos ?? 0)} min
          </Text>
        ))}
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
