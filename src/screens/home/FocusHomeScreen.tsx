import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { listFocusSessions } from "@/services/focusService";
import { useTheme } from "@/theme/ThemeProvider";
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
    } catch (err) {
      setError("Falha ao carregar sessões de foco.");
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
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Execução de foco</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Inicie sessões Pomodoro, foco livre ou blocos profundos sem distrações.
        </Text>
        <AppButton title="Abrir sessão de foco" onPress={() => navigation.navigate("FocusSession")} />
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Ações</Text>
        <View style={styles.row}>
          <AppButton title="Histórico" onPress={() => navigation.navigate("FocusHistory")} variant="secondary" />
          <AppButton title="Coach de foco" onPress={() => navigation.navigate("Coach")} variant="secondary" />
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Últimas sessões</Text>
        {sessions.length === 0 ? (
          <EmptyState
            title="Sem sessões ainda"
            description="Inicie sua primeira sessão para começar a análise."
            actionText="Iniciar foco"
            onAction={() => navigation.navigate("FocusSession")}
          />
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.item}>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>{session.modo.replaceAll("_", " ")}</Text>
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                {formatPtDateTime(session.started_at)} • {formatDuration(Math.round(session.duracao_real_segundos / 60))} • {session.status}
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
    gap: 12,
    paddingBottom: 18
  },
  title: {
    fontSize: 16,
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  item: {
    gap: 2,
    paddingVertical: 4
  }
});
