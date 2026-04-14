import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { useRootNavigation } from "@/navigation/hooks";
import {
  getPremiumState,
  restorePurchases,
  simulatePurchasePremium,
  simulateRemoveAdsPurchase
} from "@/services/monetizationService";
import {
  getLockedPremiumFeatures,
  getPremiumCapabilities,
  PREMIUM_FEATURE_LABELS
} from "@/services/premiumCapabilities";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

const PREMIUM_PACKS = [
  { id: "default", label: "Classico" },
  { id: "aurora", label: "Aurora" },
  { id: "sunrise", label: "Sunrise" }
] as const;

export function SettingsPremiumScreen() {
  const { colors, visualPack, setVisualPack } = useTheme();
  const navigation = useRootNavigation();
  const [state, setState] = useState<Awaited<ReturnType<typeof getPremiumState>>>();

  const load = async () => {
    const premiumState = await getPremiumState();
    setState(premiumState);
  };

  useEffect(() => {
    load();
  }, []);

  const capabilities = useMemo(() => (state ? getPremiumCapabilities(state) : null), [state]);
  const locked = useMemo(() => (capabilities ? getLockedPremiumFeatures(capabilities) : []), [capabilities]);

  return (
    <View style={styles.container}>
      <AppCard tone="premium">
        <Text style={[styles.title, { color: colors.text }]}>Premium</Text>
        <Text style={[styles.body, { color: colors.text }]}>Plano: {state?.plan ?? "free"}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Premium ativo: {state?.premium_active ? "Sim" : "Nao"}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Anuncios removidos: {state?.ads_removed ? "Sim" : "Nao"}</Text>
      </AppCard>

      {!state?.premium_active && locked.length > 0 ? (
        <AppCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recursos premium bloqueados</Text>
          {locked.slice(0, 8).map((key) => (
            <Text key={key} style={[styles.caption, { color: colors.mutedText }]}>
              - {PREMIUM_FEATURE_LABELS[key]}
            </Text>
          ))}
          <AppButton title="Ver detalhes do Premium" onPress={() => navigation.navigate("Premium")} variant="secondary" />
        </AppCard>
      ) : null}

      {state?.premium_active ? (
        <AppCard tone="premium">
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acabamento premium</Text>
          <Text style={[styles.caption, { color: colors.mutedText }]}>
            Escolha o pacote visual premium para um design mais refinado.
          </Text>
          <View style={styles.inline}>
            {PREMIUM_PACKS.map((pack) => (
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
                <Text style={[styles.caption, { color: colors.text }]}>{pack.label}</Text>
              </Pressable>
            ))}
          </View>
        </AppCard>
      ) : null}

      <AppCard>
        <View style={styles.actions}>
          <AppButton
            title="Simular compra Premium"
            onPress={async () => {
              await simulatePurchasePremium();
              await load();
              Alert.alert("Compra simulada", "Premium liberado localmente.");
            }}
          />
          <AppButton
            title="Simular remover anuncios"
            onPress={async () => {
              await simulateRemoveAdsPurchase();
              await load();
              Alert.alert("Compra simulada", "Anuncios removidos localmente.");
            }}
            variant="secondary"
          />
          <AppButton
            title="Restaurar compra"
            onPress={async () => {
              await restorePurchases();
              await load();
              Alert.alert("Restaurado", "Estado local de compra restaurado.");
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
  title: {
    ...typography.h2
  },
  sectionTitle: {
    ...typography.h4
  },
  body: {
    ...typography.body
  },
  caption: {
    ...typography.small
  },
  actions: {
    gap: 10
  },
  inline: {
    flexDirection: "row",
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
