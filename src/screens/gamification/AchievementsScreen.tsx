import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { getGamificationSummary } from "@/services/gamificationService";
import { useTheme } from "@/theme/ThemeProvider";
import { formatPtDateTime } from "@/utils/date";

export function AchievementsScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [achievements, setAchievements] = useState<Array<{ id: string; nome: string; descricao: string; desbloqueada_em: string }>>([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getGamificationSummary();
      setAchievements(data.achievements);
      setError("");
    } catch (err) {
      setError("Não foi possível carregar conquistas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingState message="Carregando conquistas..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      {achievements.length === 0 ? (
        <EmptyState title="Sem conquistas desbloqueadas" description="Mantenha a consistência para desbloquear medalhas." />
      ) : (
        achievements.map((achievement) => (
          <AppCard key={achievement.id}>
            <Text style={[styles.title, { color: colors.text }]}>{achievement.nome}</Text>
            <Text style={{ color: colors.mutedText }}>{achievement.descricao}</Text>
            <Text style={{ color: colors.text, fontSize: 12 }}>Desbloqueada em {formatPtDateTime(achievement.desbloqueada_em)}</Text>
          </AppCard>
        ))
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
    fontSize: 16,
    fontWeight: "800"
  }
});
