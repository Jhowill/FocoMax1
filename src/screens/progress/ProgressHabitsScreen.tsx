import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getHabitAnalytics } from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";

export function ProgressHabitsScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof getHabitAnalytics>>>();

  const load = async () => {
    try {
      setLoading(true);
      setData(await getHabitAnalytics());
      setError("");
    } catch (err) {
      setError("Erro ao carregar hábitos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingState message="Carregando hábitos..." />;
  }
  if (error || !data) {
    return <ErrorState message={error || "Sem dados"} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Hábitos</Text>
        <Text style={{ color: colors.text }}>Registros totais: {data.total_registros ?? 0}</Text>
        <Text style={{ color: colors.text }}>Concluídos: {data.concluidos ?? 0}</Text>
        <Text style={{ color: colors.text }}>Taxa de consistência: {data.taxa_consistencia ?? 0}%</Text>
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
