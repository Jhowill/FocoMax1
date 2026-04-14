import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { PremiumGateCard } from "@/components/common/PremiumGateCard";
import { SimpleBarChart } from "@/components/common/SimpleBarChart";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getPremiumState } from "@/services/monetizationService";
import { getLockedPremiumFeatures, getPremiumCapabilities, PREMIUM_FEATURE_LABELS } from "@/services/premiumCapabilities";
import { getBehaviorInsights, getEnergyProductivityCorrelation } from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";

export function ProgressBehaviorScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof getBehaviorInsights>>>();
  const [energyCorrelation, setEnergyCorrelation] = useState<Awaited<ReturnType<typeof getEnergyProductivityCorrelation>>>([]);
  const [advancedBehaviorEnabled, setAdvancedBehaviorEnabled] = useState(false);
  const [capabilities, setCapabilities] = useState<ReturnType<typeof getPremiumCapabilities>>();

  const load = async () => {
    try {
      setLoading(true);
      const [insights, premiumState, correlation] = await Promise.all([
        getBehaviorInsights(),
        getPremiumState(),
        getEnergyProductivityCorrelation()
      ]);
      const caps = getPremiumCapabilities(premiumState);
      setAdvancedBehaviorEnabled(caps.advanced_behavior);
      setCapabilities(caps);
      setData(insights);
      setEnergyCorrelation(correlation);
      setError("");
    } catch {
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

  const actionableTips: string[] = [];
  const peak = data.byHour.reduce<{ hora?: string; media?: number }>((acc, row) => {
    const avg = row.media_foco ?? 0;
    if ((acc.media ?? -1) < avg) {
      return { hora: row.hora, media: avg };
    }
    return acc;
  }, {});
  if (peak.hora) {
    actionableTips.push(`Planeje tarefas mais exigentes perto de ${peak.hora}:00.`);
  }
  if (distractions[0]?.motivo) {
    actionableTips.push(`Seu principal gatilho e "${distractions[0].motivo}". Defina uma regra anti-distracao antes da sessao.`);
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Comportamento</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Entenda distracoes, horarios fortes e relacao entre energia e produtividade.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Motivos de distracao</Text>
        {distractions.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Sem distracoes registradas.</Text>
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
          <Text style={[styles.subtitle, { color: colors.text }]}>Horarios de melhor foco</Text>
          <SimpleBarChart labels={hourLabels} values={hourValues} />
        </AppCard>
      ) : (
        <PremiumGateCard
          title="Analise comportamental avancada e Premium"
          description="No Premium voce desbloqueia grafico completo por horario, correlacoes detalhadas e leitura guiada por impacto."
          cta="Desbloquear analise avancada"
        />
      )}

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Humor x produtividade</Text>
        {moodSeries.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Sem registros suficientes.</Text>
        ) : (
          moodSeries.map((item) => (
            <Text key={`${item.humor}`} style={{ color: colors.text, fontSize: 12 }}>
              • Humor {item.humor}: foco medio {Number(item.media_foco ?? 0).toFixed(1)}
            </Text>
          ))
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Energia x entrega</Text>
        {energyCorrelation.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Sem dados de energia para correlacao.</Text>
        ) : (
          energyCorrelation.map((item) => (
            <Text key={`${item.energia}`} style={{ color: colors.text, fontSize: 12 }}>
              • Energia {item.energia}: tarefas medias {item.tarefasMedias}, foco medio {item.focoMedio} min
            </Text>
          ))
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Recomendacoes acionaveis</Text>
        {actionableTips.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Continue registrando sessoes para receber recomendacoes mais precisas.</Text>
        ) : (
          actionableTips.map((tip) => (
            <Text key={tip} style={{ color: colors.text, fontSize: 12 }}>
              • {tip}
            </Text>
          ))
        )}
      </AppCard>

      {!advancedBehaviorEnabled ? (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Recursos premium bloqueados</Text>
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
