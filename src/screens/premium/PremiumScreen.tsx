import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { getPremiumState, restorePurchases, simulatePurchasePremium } from "@/services/monetizationService";
import {
  getLockedPremiumFeatures,
  getPremiumCapabilities,
  PREMIUM_FEATURE_DESCRIPTIONS,
  PREMIUM_FEATURE_LABELS,
  PremiumFeatureKey
} from "@/services/premiumCapabilities";
import { useTheme } from "@/theme/ThemeProvider";

const FEATURE_GROUPS: Array<{ title: string; items: PremiumFeatureKey[] }> = [
  {
    title: "Inteligência e resultado",
    items: ["full_coach", "advanced_behavior", "advanced_reports", "smart_planning"]
  },
  {
    title: "Execução e histórico",
    items: ["unlimited_focus_history", "premium_challenges"]
  },
  {
    title: "Experiência e personalização",
    items: ["remove_ads", "premium_themes", "advanced_exports"]
  }
];

export function PremiumScreen() {
  const { colors } = useTheme();
  const [state, setState] = useState<Awaited<ReturnType<typeof getPremiumState>>>();

  const load = async () => {
    setState(await getPremiumState());
  };

  useEffect(() => {
    load();
  }, []);

  const capabilities = useMemo(
    () => (state ? getPremiumCapabilities(state) : null),
    [state]
  );

  const locked = useMemo(
    () => (capabilities ? getLockedPremiumFeatures(capabilities) : []),
    [capabilities]
  );

  const isPremium = Boolean(state?.premium_active);

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>FocoMax Premium</Text>
        <Text style={{ color: colors.mutedText }}>
          Plano atual: {isPremium ? "Premium ativo" : "Gratuito"}
        </Text>
        {!isPremium ? (
          <Text style={{ color: colors.text, fontSize: 13 }}>
            Seu upgrade desbloqueia recursos focados em resultado real, com mais clareza de desempenho e decisões automáticas.
          </Text>
        ) : (
          <Text style={{ color: colors.text, fontSize: 13 }}>
            Você já tem acesso completo às ferramentas avançadas de foco, comportamento e planejamento inteligente.
          </Text>
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Comparativo rápido</Text>
        <Text style={{ color: colors.text }}>Gratuito: base forte para uso diário.</Text>
        <Text style={{ color: colors.text }}>Premium: decisão mais precisa, execução com mais controle e análise profunda.</Text>
      </AppCard>

      {FEATURE_GROUPS.map((group) => (
        <AppCard key={group.title}>
          <Text style={[styles.subtitle, { color: colors.text }]}>{group.title}</Text>
          {group.items.map((featureKey) => {
            const unlocked = capabilities ? capabilities[featureKey] : false;
            return (
              <View key={featureKey} style={styles.featureRow}>
                <Text style={{ color: unlocked ? colors.success : colors.mutedText, fontWeight: "700", fontSize: 12 }}>
                  {unlocked ? "✓" : "LOCK"}
                </Text>
                <View style={styles.featureTextBlock}>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
                    {PREMIUM_FEATURE_LABELS[featureKey]}
                  </Text>
                  <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                    {PREMIUM_FEATURE_DESCRIPTIONS[featureKey]}
                  </Text>
                </View>
              </View>
            );
          })}
        </AppCard>
      ))}

      {!isPremium && locked.length > 0 ? (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Você desbloqueia agora</Text>
          {locked.slice(0, 5).map((featureKey) => (
            <Text key={featureKey} style={{ color: colors.text, fontSize: 12 }}>
              • {PREMIUM_FEATURE_LABELS[featureKey]}
            </Text>
          ))}
        </AppCard>
      ) : null}

      <AppCard>
        <View style={styles.actions}>
          <AppButton
            title={isPremium ? "Premium já ativo" : "Assinar Premium (simulação local)"}
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
    gap: 12
  },
  title: {
    fontSize: 22,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "800"
  },
  actions: {
    gap: 8
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8
  },
  featureTextBlock: {
    flex: 1,
    gap: 2
  }
});
