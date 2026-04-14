import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { RootStackParamList } from "@/navigation/types";
import { getFocusSessionById, listFocusInterruptions } from "@/services/focusService";
import { useTheme } from "@/theme/ThemeProvider";
import { formatDuration, formatPtDateTime } from "@/utils/date";

type Props = NativeStackScreenProps<RootStackParamList, "FocusSummary">;

export function FocusSummaryScreen({ route }: Props) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Awaited<ReturnType<typeof getFocusSessionById>>>();
  const [interruptions, setInterruptions] = useState<Awaited<ReturnType<typeof listFocusInterruptions>>>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [sessionData, interruptionData] = await Promise.all([getFocusSessionById(id), listFocusInterruptions(id)]);
      setSession(sessionData);
      setInterruptions(interruptionData);
      setError("");
    } catch {
      setError("Falha ao carregar resumo da sessão.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return <LoadingState message="Carregando resumo..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }
  if (!session) {
    return <EmptyState title="Sessão não encontrada" description="Esse registro pode ter sido removido." />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Resumo da sessão</Text>
        <Text style={{ color: colors.text }}>Modo: {session.modo.replaceAll("_", " ")}</Text>
        <Text style={{ color: colors.text }}>Status: {session.status}</Text>
        <Text style={{ color: colors.text }}>Início: {formatPtDateTime(session.started_at)}</Text>
        <Text style={{ color: colors.text }}>
          Duração real: {formatDuration(Math.round((session.duracao_real_segundos ?? 0) / 60))}
        </Text>
        <Text style={{ color: colors.text }}>Dificuldade: {session.dificuldade ?? "-"}</Text>
        <Text style={{ color: colors.text }}>Nível de foco: {session.foco_nivel ?? "-"}</Text>
        <Text style={{ color: colors.text }}>Distração: {session.houve_distracao ? "Sim" : "Não"}</Text>
        <Text style={{ color: colors.mutedText }}>{session.nota_rapida || "Sem nota rápida."}</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Interrupções registradas</Text>
        {interruptions.length === 0 ? (
          <Text style={{ color: colors.mutedText }}>Nenhuma interrupção nessa sessão.</Text>
        ) : (
          interruptions.map((item) => (
            <Text key={item.id} style={{ color: colors.text, fontSize: 12 }}>
              • {item.motivo} - {item.descricao || "sem observação"}
            </Text>
          ))
        )}
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
  }
});
