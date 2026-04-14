import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { listFocusSessions } from "@/services/focusService";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/typography";
import { formatDuration, formatPtDateTime } from "@/utils/date";

export function FocusHomeScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof listFocusSessions>>>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setSessions(await listFocusSessions(6));
      setError("");
    } catch {
      setError("Falha ao carregar sessoes de foco.");
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
    return <LoadingState message="Carregando foco..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard tone="premium">
        <Text style={[styles.title, { color: colors.text }]}>Execucao de foco</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Inicie sessoes Pomodoro, foco livre ou blocos profundos sem distracoes.
        </Text>
        <AppButton title="Abrir sessao de foco" onPress={() => navigation.navigate("FocusSession")} />
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Acoes</Text>
        <View style={styles.row}>
          <AppButton title="Historico" onPress={() => navigation.navigate("FocusHistory")} variant="secondary" />
          <AppButton title="Coach de foco" onPress={() => navigation.navigate("Coach")} variant="secondary" />
        </View>
      </AppCard>

      <AppCard tone="soft">
        <Text style={[styles.title, { color: colors.text }]}>Ultimas sessoes</Text>
        {sessions.length === 0 ? (
          <EmptyState
            title="Sem sessoes ainda"
            description="Inicie sua primeira sessao para comecar a analise."
            actionText="Iniciar foco"
            onAction={() => navigation.navigate("FocusSession")}
          />
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.item}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{session.modo.replaceAll("_", " ")}</Text>
              <Text style={[styles.itemMeta, { color: colors.mutedText }]}>
                {formatPtDateTime(session.started_at)} | {formatDuration(Math.round(session.duracao_real_segundos / 60))} | {session.status}
              </Text>
            </View>
          ))
        )}
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
    ...typography.h4
  },
  body: {
    ...typography.body
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  item: {
    gap: 4,
    paddingVertical: 6
  },
  itemTitle: {
    ...typography.small,
    fontWeight: "700"
  },
  itemMeta: {
    ...typography.caption
  }
});
