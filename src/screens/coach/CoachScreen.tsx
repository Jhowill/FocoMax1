import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { PremiumGateCard } from "@/components/common/PremiumGateCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import {
  dismissSuggestion,
  generateAdvancedWeeklyPlan,
  listCoachSuggestions,
  regenerateSuggestions,
  setSuggestionFeedback
} from "@/services/coachService";
import { getPremiumState } from "@/services/monetizationService";
import { getPremiumCapabilities } from "@/services/premiumCapabilities";
import { useTheme } from "@/theme/ThemeProvider";

export function CoachScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof listCoachSuggestions>>>([]);
  const [fullCoachEnabled, setFullCoachEnabled] = useState(false);
  const [weeklyPlanEnabled, setWeeklyPlanEnabled] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<Awaited<ReturnType<typeof generateAdvancedWeeklyPlan>>>();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [rows, premiumState] = await Promise.all([listCoachSuggestions(), getPremiumState()]);
      const capabilities = getPremiumCapabilities(premiumState);
      setFullCoachEnabled(capabilities.full_coach);
      setWeeklyPlanEnabled(capabilities.weekly_plan);
      setSuggestions(rows);
      if (capabilities.weekly_plan) {
        setWeeklyPlan(await generateAdvancedWeeklyPlan());
      } else {
        setWeeklyPlan(undefined);
      }
      setError("");
    } catch {
      setError("Falha ao carregar coach.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const regenerate = async () => {
    setLoading(true);
    const rows = await regenerateSuggestions();
    setSuggestions(rows);
    if (weeklyPlanEnabled) {
      setWeeklyPlan(await generateAdvancedWeeklyPlan());
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingState message="Gerando recomendacoes..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const visibleSuggestions = suggestions.slice(0, fullCoachEnabled ? suggestions.length : 2);

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Coach de foco</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Recomendacoes automaticas baseadas no seu comportamento local.
        </Text>
        <AppButton title="Atualizar sugestoes" onPress={regenerate} />
      </AppCard>

      {suggestions.length === 0 ? (
        <EmptyState
          title="Sem sugestoes no momento"
          description="Conclua sessoes para o coach aprender seu padrao."
          actionText="Gerar agora"
          onAction={regenerate}
        />
      ) : (
        visibleSuggestions.map((suggestion) => (
          <AppCard key={suggestion.id}>
            <Text style={[styles.subtitle, { color: colors.text }]}>{suggestion.texto}</Text>
            <Text style={{ color: colors.mutedText, fontSize: 12 }}>Status: {suggestion.util_status}</Text>
            <View style={styles.actions}>
              <AppButton
                title="Util"
                onPress={async () => {
                  await setSuggestionFeedback(suggestion.id, "util");
                  await load();
                }}
                variant="secondary"
              />
              <AppButton
                title="Ignorar"
                onPress={async () => {
                  await setSuggestionFeedback(suggestion.id, "ignorado");
                  await dismissSuggestion(suggestion.id);
                  await load();
                }}
                variant="secondary"
              />
              <AppButton
                title="Favoritar"
                onPress={async () => {
                  await setSuggestionFeedback(suggestion.id, "favorita");
                  await load();
                }}
                variant="secondary"
              />
            </View>
          </AppCard>
        ))
      )}

      {!fullCoachEnabled && suggestions.length > 2 ? (
        <PremiumGateCard
          title="Coach completo e Premium"
          description="No Premium voce desbloqueia mais recomendacoes ao mesmo tempo, com leitura de impacto e priorizacao pratica."
          cta="Desbloquear coach completo"
        />
      ) : null}

      {weeklyPlanEnabled && weeklyPlan ? (
        <AppCard>
          <Text style={[styles.title, { color: colors.text, fontSize: 16 }]}>Plano semanal premium</Text>
          <Text style={{ color: colors.mutedText, fontSize: 12 }}>{weeklyPlan.headline}</Text>
          <Text style={{ color: colors.text, fontSize: 12 }}>
            Base de foco: {weeklyPlan.focusBaseline} min/dia - melhor janela: {weeklyPlan.bestWindow}
          </Text>
          {weeklyPlan.days.slice(0, 4).map((day) => (
            <Text key={day.dateRef} style={{ color: colors.text, fontSize: 12 }}>
              • {day.dateRef}: {day.focusTarget} min, tarefa {day.priorityTask}, habito {day.habitFocus}.
            </Text>
          ))}
        </AppCard>
      ) : (
        <PremiumGateCard
          title="Plano semanal personalizado"
          description="No Premium voce recebe plano semanal gerado por padrao real de foco, tarefas criticas e habitos."
          cta="Desbloquear plano semanal"
        />
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
    fontSize: 20,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  actions: {
    gap: 8
  }
});
