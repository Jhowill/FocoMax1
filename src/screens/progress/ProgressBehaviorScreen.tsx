import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { PremiumGateCard } from "@/components/common/PremiumGateCard";
import { SimpleBarChart } from "@/components/common/SimpleBarChart";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getPremiumState } from "@/services/monetizationService";
import {
  getLockedPremiumFeatures,
  getPremiumCapabilities,
  PREMIUM_FEATURE_LABELS
} from "@/services/premiumCapabilities";
import { getBehaviorInsights } from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";

export function ProgressBehaviorScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof getBehaviorInsights>>>();
  const [advancedBehaviorEnabled, setAdvancedBehaviorEnabled] = useState(false);
  const [capabilities, setCapabilities] = useState<ReturnType<typeof getPremiumCapabilities>>();

  const load = async () => {
    try {
      setLoading(true);
      const [insights, premiumState] = await Promise.all([getBehaviorInsights(), getPremiumState()]);
      const caps = getPremiumCapabilities(premiumState);
      setAdvancedBehaviorEnabled(caps.advanced_behavior);
      setCapabilities(caps);
      setData(insights);
      setError("");
    } catch (err) {
      setError("Erro ao carregar comportamento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingState message="Carregando comportamento..." />;
  }
  if (error || !data) {
    return <ErrorState message={error || "Sem dados"} onRetry={load} />;
  }

  const hourLabels = data.byHour.map((item) => item.hora);
  const hourValues = data.byHour.map((item) => Math.round(item.media_foco ?? 0));
  const distractions = data.topDistractions.slice(0, advancedBehaviorEnabled ? data.topDistractions.length : 2);
  const moodSeries = data.moodVsProductivity.slice(0, advancedBehaviorEnabled ? data.moodVsProductivity.length : 2);
  const locked = capabilities ? getLockedPremiumFeatures(capabilities) : [];

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Comportamento</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Entenda distrações, horários fortes e correlação entre energia e produtividade.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Motivos de distração mais comuns</Text>
        {distractions.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Sem distrações registradas.</Text>
        ) : (
          distractions.map((item) => (
            <Text key={item.motivo} style={{ color: colors.text, fontSize: 12 }}>
              • {item.motivo}: {item.total}
            </Text>
          ))
        )}
      </AppCard>

      {advancedBehaviorEnabled ? (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Horários de melhor foco</Text>
          <SimpleBarChart labels={hourLabels} values={hourValues} />
        </AppCard>
      ) : (
        <PremiumGateCard
          title="Análise comportamental avançada é Premium"
          description="No Premium você desbloqueia gráfico completo por horário, correlações detalhadas e leitura guiada por impacto."
          cta="Desbloquear análise avançada"
        />
      )}

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Humor vs produtividade</Text>
        {moodSeries.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Sem registros de humor suficientes.</Text>
        ) : (
          moodSeries.map((item) => (
            <Text key={`${item.humor}`} style={{ color: colors.text, fontSize: 12 }}>
              • Humor {item.humor}: foco médio {Number(item.media_foco ?? 0).toFixed(1)}
            </Text>
          ))
        )}
      </AppCard>

      {!advancedBehaviorEnabled ? (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Recursos Premium bloqueados</Text>
          {locked
            .filter((key) => key === "advanced_behavior" || key === "advanced_reports")
            .map((key) => (
              <Text key={key} style={{ color: colors.mutedText, fontSize: 12 }}>
                • {PREMIUM_FEATURE_LABELS[key]}
              </Text>
            ))}
        </AppCard>
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
    fontSize: 18,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "800"
  }
});
