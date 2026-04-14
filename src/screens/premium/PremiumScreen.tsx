import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { exportPremiumCsvReport } from "@/services/backupService";
import { generateAdvancedWeeklyPlan } from "@/services/coachService";
import { getPremiumState, restorePurchases, simulatePurchasePremium } from "@/services/monetizationService";
import {
  getLockedPremiumFeatures,
  getPremiumCapabilities,
  PREMIUM_FEATURE_DESCRIPTIONS,
  PREMIUM_FEATURE_LABELS,
  PremiumFeatureKey
} from "@/services/premiumCapabilities";
import { getLongTermMonthlyTrend } from "@/services/progressService";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

const FEATURE_GROUPS: { title: string; items: PremiumFeatureKey[] }[] = [
  {
    title: "Inteligencia e execucao",
    items: ["full_coach", "weekly_plan", "smart_planning", "advanced_behavior"]
  },
  {
    title: "Analise e decisao",
    items: ["advanced_reports", "long_term_trends", "advanced_exports", "unlimited_focus_history"]
  },
  {
    title: "Acabamento premium",
    items: ["premium_visual_finishing", "premium_themes", "premium_challenges", "auto_backup_pro", "remove_ads"]
  }
];

const VISUAL_PACKS = [
  { id: "default", name: "Classico Premium" },
  { id: "aurora", name: "Aurora Focus" },
  { id: "sunrise", name: "Sunrise Clarity" }
] as const;

export function PremiumScreen() {
  const { colors, visualPack, setVisualPack } = useTheme();
  const [state, setState] = useState<Awaited<ReturnType<typeof getPremiumState>>>();
  const [weeklyPlan, setWeeklyPlan] = useState<Awaited<ReturnType<typeof generateAdvancedWeeklyPlan>>>();
  const [trend, setTrend] = useState<Awaited<ReturnType<typeof getLongTermMonthlyTrend>>>();

  const load = async () => {
    const premiumState = await getPremiumState();
    setState(premiumState);
    const capabilities = getPremiumCapabilities(premiumState);
    if (capabilities.weekly_plan) {
      setWeeklyPlan(await generateAdvancedWeeklyPlan());
    } else {
      setWeeklyPlan(undefined);
    }
    if (capabilities.long_term_trends) {
      setTrend(await getLongTermMonthlyTrend(6));
    } else {
      setTrend(undefined);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const capabilities = useMemo(() => (state ? getPremiumCapabilities(state) : null), [state]);
  const locked = useMemo(() => (capabilities ? getLockedPremiumFeatures(capabilities) : []), [capabilities]);
  const isPremium = Boolean(state?.premium_active);

  return (
    <View style={styles.container}>
      <AppCard tone="premium" style={[styles.hero, { borderColor: colors.accent }]}>
        <Text style={[styles.title, { color: colors.text }]}>FocoMax Premium</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Plano atual: {isPremium ? "Premium ativo" : "Gratuito"}
        </Text>
        <Text style={[styles.body, { color: colors.text }]}>
          Premium foi desenhado para entregar mais resultado, mais leitura de desempenho e mais acabamento visual.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Comparativo direto</Text>
        <View style={styles.compareGrid}>
          <View style={[styles.compareCol, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
            <Text style={[styles.compareTitle, { color: colors.text }]}>Plano Gratuito</Text>
            <Text style={[styles.compareItem, { color: colors.mutedText }]}>- Timer e foco basico</Text>
            <Text style={[styles.compareItem, { color: colors.mutedText }]}>- Tarefas e habitos essenciais</Text>
            <Text style={[styles.compareItem, { color: colors.mutedText }]}>- Historico limitado</Text>
            <Text style={[styles.compareItem, { color: colors.mutedText }]}>- Analises basicas</Text>
          </View>
          <View style={[styles.compareCol, { borderColor: colors.accent, backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.compareTitle, { color: colors.text }]}>Plano Premium</Text>
            <Text style={[styles.compareItem, { color: colors.text }]}>- Coach completo com regras avancadas</Text>
            <Text style={[styles.compareItem, { color: colors.text }]}>- Planejamento semanal inteligente</Text>
            <Text style={[styles.compareItem, { color: colors.text }]}>- Historico ilimitado + tendencia longa</Text>
            <Text style={[styles.compareItem, { color: colors.text }]}>- Exportacao premium + sem anuncios</Text>
          </View>
        </View>
      </AppCard>

      {FEATURE_GROUPS.map((group) => (
        <AppCard key={group.title} tone="soft">
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{group.title}</Text>
          {group.items.map((featureKey) => {
            const unlocked = capabilities ? capabilities[featureKey] : false;
            return (
              <View key={featureKey} style={styles.featureRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: unlocked ? colors.success : colors.mutedText
                    }
                  ]}
                />
                <View style={styles.featureTextBlock}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>{PREMIUM_FEATURE_LABELS[featureKey]}</Text>
                  <Text style={[styles.featureDesc, { color: colors.mutedText }]}>{PREMIUM_FEATURE_DESCRIPTIONS[featureKey]}</Text>
                </View>
                <Text style={[styles.badge, { color: unlocked ? colors.success : colors.warning }]}>
                  {unlocked ? "ATIVO" : "PREMIUM"}
                </Text>
              </View>
            );
          })}
        </AppCard>
      ))}

      {isPremium && weeklyPlan ? (
        <AppCard tone="premium">
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Plano semanal premium</Text>
          <Text style={[styles.caption, { color: colors.mutedText }]}>
            Base de foco: {weeklyPlan.focusBaseline} min/dia | melhor janela: {weeklyPlan.bestWindow}
          </Text>
          {weeklyPlan.days.slice(0, 4).map((day) => (
            <Text key={day.dateRef} style={[styles.caption, { color: colors.text }]}>
              - {day.dateRef}: {day.focusTarget} min, tarefa {day.priorityTask}.
            </Text>
          ))}
        </AppCard>
      ) : null}

      {isPremium && trend ? (
        <AppCard tone="premium">
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tendencia de longo prazo</Text>
          <Text style={[styles.body, { color: colors.text }]}>{trend.summary}</Text>
          <Text style={[styles.caption, { color: colors.mutedText }]}>
            Direcao: {trend.trendDirection} | consistencia media: {trend.consistencyScore}%
          </Text>
        </AppCard>
      ) : null}

      {isPremium ? (
        <AppCard tone="premium">
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Visual premium</Text>
          <Text style={[styles.caption, { color: colors.mutedText }]}>
            Escolha seu pacote premium para acabamento mais sofisticado.
          </Text>
          <View style={styles.inlineWrap}>
            {VISUAL_PACKS.map((pack) => (
              <Pressable
                key={pack.id}
                onPress={() => setVisualPack(pack.id)}
                style={[
                  styles.pill,
                  {
                    borderColor: visualPack === pack.id ? colors.primary : colors.border,
                    backgroundColor: visualPack === pack.id ? colors.primarySoft : colors.inputBackground
                  }
                ]}
              >
                <Text style={[styles.caption, { color: colors.text }]}>{pack.name}</Text>
              </Pressable>
            ))}
          </View>
          <AppButton
            title="Exportar relatorio premium CSV"
            onPress={async () => {
              const path = await exportPremiumCsvReport();
              Alert.alert("Relatorio premium", path);
            }}
            variant="secondary"
          />
        </AppCard>
      ) : (
        <AppCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Voce desbloqueia agora</Text>
          {locked.slice(0, 8).map((featureKey) => (
            <Text key={featureKey} style={[styles.caption, { color: colors.text }]}>
              - {PREMIUM_FEATURE_LABELS[featureKey]}
            </Text>
          ))}
        </AppCard>
      )}

      <AppCard>
        <View style={styles.actions}>
          <AppButton
            title={isPremium ? "Premium ja ativo" : "Assinar Premium (simulacao local)"}
            onPress={async () => {
              if (isPremium) {
                return;
              }
              await simulatePurchasePremium();
              await load();
              Alert.alert("Premium ativado", "Compra simulada localmente para testes.");
            }}
            disabled={isPremium}
          />
          <AppButton
            title="Restaurar compra"
            onPress={async () => {
              await restorePurchases();
              await load();
              Alert.alert("Compras restauradas", "Estado local atualizado.");
            }}
            variant="secondary"
          />
        </View>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingBottom: 20
  },
  hero: {
    borderWidth: 1.4
  },
  title: {
    ...typography.h2
  },
  subtitle: {
    ...typography.subtitle
  },
  body: {
    ...typography.body
  },
  sectionTitle: {
    ...typography.h4
  },
  caption: {
    ...typography.small
  },
  compareGrid: {
    gap: 10
  },
  compareCol: {
    borderWidth: 1.2,
    borderRadius: radius.lg,
    padding: 14,
    gap: 6
  },
  compareTitle: {
    ...typography.subtitle
  },
  compareItem: {
    ...typography.small
  },
  actions: {
    gap: 10
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10
  },
  statusDot: {
    marginTop: 7,
    width: 10,
    height: 10,
    borderRadius: 10
  },
  featureTextBlock: {
    flex: 1,
    gap: 3
  },
  featureTitle: {
    ...typography.small,
    fontWeight: "700"
  },
  featureDesc: {
    ...typography.caption
  },
  badge: {
    ...typography.overline
  },
  inlineWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  pill: {
    borderWidth: 1.2,
    borderRadius: radius.md,
    minHeight: 38,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center"
  }
});
