import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { PremiumGateCard } from "@/components/common/PremiumGateCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { dismissSuggestion, listCoachSuggestions, regenerateSuggestions, setSuggestionFeedback } from "@/services/coachService";
import { getPremiumState } from "@/services/monetizationService";
import { getPremiumCapabilities } from "@/services/premiumCapabilities";
import { useTheme } from "@/theme/ThemeProvider";

export function CoachScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof listCoachSuggestions>>>([]);
  const [fullCoachEnabled, setFullCoachEnabled] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [rows, premiumState] = await Promise.all([listCoachSuggestions(), getPremiumState()]);
      const capabilities = getPremiumCapabilities(premiumState);
      setFullCoachEnabled(capabilities.full_coach);
      setSuggestions(rows);
      setError("");
    } catch (err) {
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
    setLoading(false);
  };

  if (loading) {
    return <LoadingState message="Gerando recomendações..." />;
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
          Recomendações automáticas baseadas no seu comportamento local.
        </Text>
        <AppButton title="Atualizar sugestões" onPress={regenerate} />
      </AppCard>

      {suggestions.length === 0 ? (
        <EmptyState
          title="Sem sugestões no momento"
          description="Conclua sessões para o coach aprender seu padrão."
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
                title="Útil"
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
          title="Coach completo é Premium"
          description="No Premium você desbloqueia mais recomendações ao mesmo tempo, com leitura de impacto e priorização prática."
          cta="Desbloquear coach completo"
        />
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
    fontSize: 14,
    fontWeight: "700"
  },
  actions: {
    gap: 8
  }
});
