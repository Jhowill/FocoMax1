import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { PremiumGateCard } from "@/components/common/PremiumGateCard";
import { Segmented } from "@/components/common/Segmented";
import { SimpleBarChart } from "@/components/common/SimpleBarChart";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getPremiumState } from "@/services/monetizationService";
import { getPremiumCapabilities } from "@/services/premiumCapabilities";
import {
  getComparativeTrends,
  getLongTermMonthlyTrend,
  getProgressOverview,
  getWeeklyNarrativeReport
} from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";

type Period = "daily" | "weekly" | "monthly";

export function ProgressOverviewScreen() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof getProgressOverview>>>([]);
  const [weeklyReport, setWeeklyReport] = useState<Awaited<ReturnType<typeof getWeeklyNarrativeReport>>>();
  const [trend, setTrend] = useState<Awaited<ReturnType<typeof getComparativeTrends>>>();
  const [longTerm, setLongTerm] = useState<Awaited<ReturnType<typeof getLongTermMonthlyTrend>>>();
  const [longTermEnabled, setLongTermEnabled] = useState(false);

  const load = useCallback(async (selectedPeriod: Period) => {
    try {
      setLoading(true);
      const [overviewRows, report, trendData, premiumState] = await Promise.all([
        getProgressOverview(selectedPeriod),
        getWeeklyNarrativeReport(),
        getComparativeTrends(),
        getPremiumState()
      ]);
      const capabilities = getPremiumCapabilities(premiumState);
      setLongTermEnabled(capabilities.long_term_trends);
      if (capabilities.long_term_trends) {
        setLongTerm(await getLongTermMonthlyTrend(6));
      } else {
        setLongTerm(undefined);
      }
      setRows(overviewRows);
      setWeeklyReport(report);
      setTrend(trendData);
      setError("");
    } catch {
      setError("Erro ao carregar resumo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(period);
  }, [period, load]);

  if (loading) {
    return <LoadingState message="Montando resumo..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={() => void load(period)} />;
  }

  const labels = rows
    .slice()
    .reverse()
    .map((item) => item.label.slice(-5));
  const focusValues = rows
    .slice()
    .reverse()
    .map((item) => item.foco_min ?? 0);
  const latest = rows[0];

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Resumo de progresso</Text>
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { label: "Diario", value: "daily" },
            { label: "Semanal", value: "weekly" },
            { label: "Mensal", value: "monthly" }
          ]}
        />
        <SimpleBarChart labels={labels} values={focusValues} />
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Ultimo periodo</Text>
        <Text style={{ color: colors.text }}>Foco total: {latest?.foco_min ?? 0} min</Text>
        <Text style={{ color: colors.text }}>Sessoes concluidas: {latest?.sessoes_concluidas ?? 0}</Text>
        <Text style={{ color: colors.text }}>Tarefas concluidas: {latest?.tarefas_concluidas ?? 0}</Text>
        <Text style={{ color: colors.text }}>Habitos concluidos: {latest?.habitos_concluidos ?? 0}</Text>
      </AppCard>

      {weeklyReport ? (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Leitura semanal</Text>
          <Text style={{ color: colors.text }}>{weeklyReport.summary}</Text>
          {weeklyReport.highlights.map((item) => (
            <Text key={item} style={{ color: colors.mutedText, fontSize: 12 }}>
              • {item}
            </Text>
          ))}
        </AppCard>
      ) : null}

      {trend ? (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Comparativo mensal</Text>
          <Text style={{ color: colors.text }}>Foco: {trend.deltaFocus >= 0 ? "+" : ""}{trend.deltaFocus} min</Text>
          <Text style={{ color: colors.text }}>Tarefas: {trend.deltaTasks >= 0 ? "+" : ""}{trend.deltaTasks}</Text>
          <Text style={{ color: colors.text }}>Habitos: {trend.deltaHabits >= 0 ? "+" : ""}{trend.deltaHabits}</Text>
        </AppCard>
      ) : null}

      {longTermEnabled && longTerm ? (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Longo prazo premium</Text>
          <Text style={{ color: colors.text }}>{longTerm.summary}</Text>
          <Text style={{ color: colors.mutedText, fontSize: 12 }}>
            Direcao: {longTerm.trendDirection} | consistencia media: {longTerm.consistencyScore}%
          </Text>
        </AppCard>
      ) : (
        <PremiumGateCard
          title="Analise de longo prazo"
          description="No Premium voce libera tendencia mensal de longo prazo para ajustar a rotina com antecedencia."
          cta="Desbloquear analise premium"
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
    fontSize: 18,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "800"
  }
});
