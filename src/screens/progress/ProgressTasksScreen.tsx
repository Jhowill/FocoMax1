import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getTaskAnalytics } from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";

export function ProgressTasksScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof getTaskAnalytics>>>();

  const load = async () => {
    try {
      setLoading(true);
      setData(await getTaskAnalytics());
      setError("");
    } catch {
      setError("Erro ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingState message="Carregando tarefas..." />;
  }
  if (error || !data) {
    return <ErrorState message={error || "Sem dados"} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Tarefas</Text>
        <Text style={{ color: colors.text }}>Criadas: {data.criadas ?? 0}</Text>
        <Text style={{ color: colors.text }}>Concluídas: {data.concluidas ?? 0}</Text>
        <Text style={{ color: colors.text }}>Atrasadas: {data.atrasadas ?? 0}</Text>
        <Text style={{ color: colors.text }}>Taxa de conclusão: {data.taxa_conclusao ?? 0}%</Text>
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
  }
});
