import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AdBanner } from "@/components/common/AdBanner";
import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { getPremiumState } from "@/services/monetizationService";
import { getProfileSummary } from "@/services/userService";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/typography";
import { formatDuration } from "@/utils/date";

export function ProfileHomeScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getProfileSummary>>>();
  const [premium, setPremium] = useState<Awaited<ReturnType<typeof getPremiumState>>>();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [profile, premiumState] = await Promise.all([getProfileSummary(), getPremiumState()]);
      setSummary(profile);
      setPremium(premiumState);
      setError("");
    } catch {
      setError("Nao foi possivel carregar o perfil.");
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
    return <LoadingState message="Abrindo perfil..." />;
  }
  if (error || !summary) {
    return <ErrorState message={error || "Perfil indisponivel"} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard tone="premium">
        <Text style={[styles.name, { color: colors.text }]}>{summary.user?.nome ?? "Usuario Local"}</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Objetivo principal: {summary.user?.objetivo_principal ?? "Nao definido"}
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.section, { color: colors.text }]}>Indicadores</Text>
        <Text style={[styles.body, { color: colors.text }]}>Nivel atual: {summary.profile?.nivel ?? 1}</Text>
        <Text style={[styles.body, { color: colors.text }]}>XP: {summary.profile?.xp_total ?? 0}</Text>
        <Text style={[styles.body, { color: colors.text }]}>
          Foco acumulado: {formatDuration(summary.profile?.foco_acumulado_min ?? 0)}
        </Text>
        <Text style={[styles.body, { color: colors.text }]}>Tarefas concluidas: {summary.profile?.tarefas_concluidas ?? 0}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Habitos mantidos: {summary.profile?.habitos_mantidos ?? 0}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Conquistas: {summary.achievements}</Text>
      </AppCard>

      <AppCard tone="soft">
        <Text style={[styles.section, { color: colors.text }]}>Plano</Text>
        <Text style={[styles.body, { color: colors.text }]}>{premium?.premium_active ? "Premium ativo" : "Plano gratuito"}</Text>
        <View style={styles.actions}>
          <AppButton title="Configuracoes" onPress={() => navigation.navigate("Settings")} />
          <AppButton title="Backup" onPress={() => navigation.navigate("BackupExport")} variant="secondary" />
          <AppButton title="Exportar" onPress={() => navigation.navigate("BackupExport")} variant="secondary" />
          <AppButton title="Gamificacao" onPress={() => navigation.navigate("Gamification")} variant="secondary" />
          <AppButton title="Coach de foco" onPress={() => navigation.navigate("Coach")} variant="secondary" />
          <AppButton title="Premium" onPress={() => navigation.navigate("Premium")} variant="secondary" />
        </View>
      </AppCard>

      <AdBanner placement="profile" onUpgrade={load} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingBottom: 20
  },
  name: {
    ...typography.h2
  },
  section: {
    ...typography.h4
  },
  body: {
    ...typography.body
  },
  actions: {
    gap: 10
  }
});
