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
    } catch (err) {
      setError("Não foi possível carregar histórico.");
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
    return <LoadingState message="Carregando histórico de foco..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Histórico de sessões</Text>
        {!hasUnlimitedHistory ? (
          <Text style={{ color: colors.mutedText, fontSize: 12 }}>Plano gratuito: histórico de até 30 sessões.</Text>
        ) : null}
      </AppCard>

      {sessions.length === 0 ? (
        <EmptyState title="Sem sessões registradas" description="Inicie uma sessão para aparecer aqui." />
      ) : (
        <AppCard>
          {sessions.map((session) => (
            <Pressable
              key={session.id}
              style={styles.item}
              onPress={() => navigation.navigate("FocusSummary", { id: session.id })}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>{session.modo.replaceAll("_", " ")}</Text>
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                {formatPtDateTime(session.started_at)} • {formatDuration(Math.round(session.duracao_real_segundos / 60))} • {session.status}
              </Text>
            </Pressable>
          ))}
        </AppCard>
      )}

      {!hasUnlimitedHistory ? (
        <PremiumGateCard
          title="Histórico completo é Premium"
          description="Desbloqueie histórico ilimitado para comparar períodos longos e identificar sua evolução real."
          cta="Desbloquear histórico completo"
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
    fontSize: 18,
    fontWeight: "800"
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.3)",
    marginBottom: 8,
    paddingBottom: 8,
    gap: 2
  }
});
