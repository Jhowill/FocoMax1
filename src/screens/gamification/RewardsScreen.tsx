import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getGamificationSummary } from "@/services/gamificationService";
import { getPremiumState } from "@/services/monetizationService";
import { useTheme } from "@/theme/ThemeProvider";

export function RewardsScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [premium, setPremium] = useState(false);
  const [rewards, setRewards] = useState<{ id: string; nome: string; tipo: string; desbloqueada: number; premium: number }[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const [summary, sub] = await Promise.all([getGamificationSummary(), getPremiumState()]);
      setRewards(summary.rewards);
      setPremium(Boolean(sub.premium_active));
      setError("");
    } catch {
      setError("Erro ao carregar recompensas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingState message="Carregando recompensas..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      {rewards.map((reward) => (
        <AppCard key={reward.id}>
          <Text style={[styles.title, { color: colors.text }]}>{reward.nome}</Text>
          <Text style={{ color: colors.mutedText }}>Tipo: {reward.tipo}</Text>
          <Text style={{ color: colors.text }}>
            Status: {reward.desbloqueada ? "Desbloqueada" : reward.premium && !premium ? "Premium necessário" : "Bloqueada"}
          </Text>
        </AppCard>
      ))}
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
