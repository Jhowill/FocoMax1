import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { evaluateAchievements, getGamificationSummary } from "@/services/gamificationService";
import { useTheme } from "@/theme/ThemeProvider";

export function GamificationScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof getGamificationSummary>>>();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await evaluateAchievements();
      setData(await getGamificationSummary());
      setError("");
    } catch (err) {
      setError("Erro ao carregar gamificação.");
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
    return <LoadingState message="Carregando gamificação..." />;
  }
  if (error || !data) {
    return <ErrorState message={error || "Sem dados"} onRetry={load} />;
  }

  const nextLevelXp = (data.profile?.nivel ?? 1) * 100;
  const currentXp = data.profile?.xp_total ?? 0;

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Gamificação útil</Text>
        <Text style={{ color: colors.text }}>Nível: {data.profile?.nivel ?? 1}</Text>
        <Text style={{ color: colors.text }}>XP total: {currentXp}</Text>
        <Text style={{ color: colors.text }}>Próximo nível em: {Math.max(nextLevelXp - currentXp, 0)} XP</Text>
        <Text style={{ color: colors.text }}>Streak foco: {data.streakFoco?.atual ?? 0} dias</Text>
        <Text style={{ color: colors.text }}>Streak hábitos: {data.streakHabito?.atual ?? 0} dias</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Desafios do dia</Text>
        <Text style={{ color: colors.text }}>• Concluir 2 sessões de foco.</Text>
        <Text style={{ color: colors.text }}>• Finalizar 3 tarefas pendentes.</Text>
        <Text style={{ color: colors.text }}>• Marcar 2 hábitos como concluídos.</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Desafios da semana</Text>
        <Text style={{ color: colors.text }}>• Manter streak de foco por 5 dias.</Text>
        <Text style={{ color: colors.text }}>• Concluir 10 tarefas.</Text>
        <Text style={{ color: colors.text }}>• Manter taxa de hábitos acima de 70%.</Text>
      </AppCard>

      <AppCard>
        <View style={styles.actions}>
          <AppButton title="Conquistas" onPress={() => navigation.navigate("Achievements")} />
          <AppButton title="Recompensas" onPress={() => navigation.navigate("Rewards")} variant="secondary" />
        </View>
      </AppCard>

      {data.achievements.length === 0 ? (
        <EmptyState title="Sem conquistas ainda" description="Sua evolução será destravada conforme você mantém consistência." />
      ) : null}
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
