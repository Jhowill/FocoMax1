import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { PremiumGateCard } from "@/components/common/PremiumGateCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { RootStackParamList } from "@/navigation/types";
import { listFocusSessions } from "@/services/focusService";
import { getPremiumState } from "@/services/monetizationService";
import { getPremiumCapabilities } from "@/services/premiumCapabilities";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/typography";
import { formatDuration, formatPtDateTime } from "@/utils/date";

type Props = NativeStackScreenProps<RootStackParamList, "FocusHistory">;

export function FocusHistoryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof listFocusSessions>>>([]);
  const [hasUnlimitedHistory, setHasUnlimitedHistory] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const premiumState = await getPremiumState();
      const capabilities = getPremiumCapabilities(premiumState);
      setHasUnlimitedHistory(capabilities.unlimited_focus_history);
      setSessions(await listFocusSessions(capabilities.unlimited_focus_history ? 200 : 30));
      setError("");
    } catch {
      setError("Nao foi possivel carregar historico.");
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
    return <LoadingState message="Carregando historico de foco..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard tone="premium">
        <Text style={[styles.title, { color: colors.text }]}>Historico de sessoes</Text>
        {!hasUnlimitedHistory ? (
          <Text style={[styles.caption, { color: colors.mutedText }]}>Plano gratuito: historico de ate 30 sessoes.</Text>
        ) : null}
      </AppCard>

      {sessions.length === 0 ? (
        <EmptyState title="Sem sessoes registradas" description="Inicie uma sessao para aparecer aqui." />
      ) : (
        <AppCard tone="soft">
          {sessions.map((session) => (
            <Pressable
              key={session.id}
              style={[styles.item, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate("FocusSummary", { id: session.id })}
            >
              <Text style={[styles.itemTitle, { color: colors.text }]}>{session.modo.replaceAll("_", " ")}</Text>
              <Text style={[styles.itemMeta, { color: colors.mutedText }]}>
                {formatPtDateTime(session.started_at)} | {formatDuration(Math.round(session.duracao_real_segundos / 60))} | {session.status}
              </Text>
            </Pressable>
          ))}
        </AppCard>
      )}

      {!hasUnlimitedHistory ? (
        <PremiumGateCard
          title="Historico completo e Premium"
          description="Desbloqueie historico ilimitado para comparar periodos longos e identificar sua evolucao real."
          cta="Desbloquear historico completo"
        />
      ) : null}
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
    ...typography.h4
  },
  caption: {
    ...typography.small
  },
  item: {
    borderBottomWidth: 1,
    marginBottom: 8,
    paddingBottom: 10,
    gap: 4
  },
  itemTitle: {
    ...typography.small,
    fontWeight: "700"
  },
  itemMeta: {
    ...typography.caption
  }
});
