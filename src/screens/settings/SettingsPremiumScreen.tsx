import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { useRootNavigation } from "@/navigation/hooks";
import {
  getPremiumState,
  restorePurchases,
  simulatePurchasePremium,
  simulateRemoveAdsPurchase
} from "@/services/monetizationService";
import { getLockedPremiumFeatures, getPremiumCapabilities, PREMIUM_FEATURE_LABELS } from "@/services/premiumCapabilities";
import { useTheme } from "@/theme/ThemeProvider";

export function SettingsPremiumScreen() {
  const { colors } = useTheme();
  const navigation = useRootNavigation();
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

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Premium</Text>
        <Text style={{ color: colors.text }}>Plano: {state?.plan ?? "free"}</Text>
        <Text style={{ color: colors.text }}>Premium ativo: {state?.premium_active ? "Sim" : "Não"}</Text>
        <Text style={{ color: colors.text }}>Anúncios removidos: {state?.ads_removed ? "Sim" : "Não"}</Text>
      </AppCard>

      {!state?.premium_active && locked.length > 0 ? (
        <AppCard>
          <Text style={[styles.subtitle, { color: colors.text }]}>Recursos ainda bloqueados</Text>
          {locked.slice(0, 5).map((key) => (
            <Text key={key} style={{ color: colors.mutedText, fontSize: 12 }}>
              • {PREMIUM_FEATURE_LABELS[key]}
            </Text>
          ))}
          <AppButton title="Ver detalhes do Premium" onPress={() => navigation.navigate("Premium")} variant="secondary" />
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
            title="Simular remover anúncios"
            onPress={async () => {
              await simulateRemoveAdsPurchase();
              await load();
              Alert.alert("Compra simulada", "Anúncios removidos localmente.");
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
