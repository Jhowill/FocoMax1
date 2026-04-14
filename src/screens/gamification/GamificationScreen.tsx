import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { getPremiumState } from "@/services/monetizationService";
import { getPremiumCapabilities } from "@/services/premiumCapabilities";
import { evaluateAchievements, getGamificationSummary, getStructuredChallenges } from "@/services/gamificationService";
import { useTheme } from "@/theme/ThemeProvider";

export function GamificationScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof getGamificationSummary>>>();
  const [challengeBoard, setChallengeBoard] = useState<Awaited<ReturnType<typeof getStructuredChallenges>>>();
  const [premiumTrackEnabled, setPremiumTrackEnabled] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await evaluateAchievements();
      const [summary, premiumState] = await Promise.all([getGamificationSummary(), getPremiumState()]);
      const capabilities = getPremiumCapabilities(premiumState);
      setPremiumTrackEnabled(capabilities.premium_challenges);
      setChallengeBoard(await getStructuredChallenges(capabilities.premium_challenges));
      setData(summary);
      setError("");
    } catch {
      setError("Erro ao carregar gamificacao.");
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
    return <LoadingState message="Carregando gamificacao..." />;
  }
  if (error || !data || !challengeBoard) {
    return <ErrorState message={error || "Sem dados"} onRetry={load} />;
  }

  const nextLevelXp = (data.profile?.nivel ?? 1) * 100;
  const currentXp = data.profile?.xp_total ?? 0;

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Gamificacao util</Text>
        <Text style={{ color: colors.text }}>Nivel: {data.profile?.nivel ?? 1}</Text>
        <Text style={{ color: colors.text }}>XP total: {currentXp}</Text>
        <Text style={{ color: colors.text }}>Proximo nivel em: {Math.max(nextLevelXp - currentXp, 0)} XP</Text>
        <Text style={{ color: colors.text }}>Streak foco: {data.streakFoco?.atual ?? 0} dias</Text>
        <Text style={{ color: colors.text }}>Streak habitos: {data.streakHabito?.atual ?? 0} dias</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Desafios diarios</Text>
        {challengeBoard.dailyChallenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeRow}>
            <Text style={{ color: colors.text, fontSize: 12 }}>{challenge.title}</Text>
            <Text style={{ color: colors.mutedText, fontSize: 12 }}>
              {challenge.progress}/{challenge.target} • +{challenge.xp} XP
            </Text>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Desafios semanais</Text>
        {challengeBoard.weeklyChallenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeRow}>
            <Text style={{ color: colors.text, fontSize: 12 }}>{challenge.title}</Text>
            <Text style={{ color: colors.mutedText, fontSize: 12 }}>
              {challenge.progress}/{challenge.target} • +{challenge.xp} XP
            </Text>
          </View>
        ))}
      </AppCard>

      {premiumTrackEnabled ? (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Trilha premium estruturada</Text>
          {challengeBoard.premiumTrack.map((challenge) => (
            <View key={challenge.id} style={styles.challengeRow}>
              <Text style={{ color: colors.text, fontSize: 12 }}>
                Fase {challenge.stage}: {challenge.title}
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                {challenge.progress}/{challenge.target} • +{challenge.xp} XP
              </Text>
            </View>
          ))}
        </AppCard>
      ) : (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Trilha premium</Text>
          <Text style={{ color: colors.mutedText, fontSize: 12 }}>
            No Premium voce libera desafios em fases com progressao estruturada e recompensas maiores.
          </Text>
          <AppButton title="Desbloquear desafios premium" onPress={() => navigation.navigate("Premium")} variant="secondary" />
        </AppCard>
      )}

      <AppCard>
        <View style={styles.actions}>
          <AppButton title="Conquistas" onPress={() => navigation.navigate("Achievements")} />
          <AppButton title="Recompensas" onPress={() => navigation.navigate("Rewards")} variant="secondary" />
        </View>
      </AppCard>

      {data.achievements.length === 0 ? (
        <EmptyState title="Sem conquistas ainda" description="Sua evolucao sera destravada conforme voce mantem consistencia." />
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
  },
  challengeRow: {
    gap: 2,
    marginBottom: 6
  }
});
