import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AdBanner } from "@/components/common/AdBanner";
import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { getTodayMoodEnergy, saveMoodEnergy } from "@/services/focusService";
import { getTodayDashboard } from "@/services/progressService";
import { useAppContext } from "@/state/AppContext";
import { useTheme } from "@/theme/ThemeProvider";
import { formatDuration } from "@/utils/date";

export function TodayScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const { userName } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof getTodayDashboard>>>();
  const [mood, setMood] = useState<Awaited<ReturnType<typeof getTodayMoodEnergy>>>();

  const [showMoodForm, setShowMoodForm] = useState(false);
  const [humor, setHumor] = useState("3");
  const [energia, setEnergia] = useState("3");
  const [dificuldade, setDificuldade] = useState("3");
  const [procrastinacao, setProcrastinacao] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, moodEntry] = await Promise.all([getTodayDashboard(), getTodayMoodEnergy()]);
      setDashboard(summary);
      setMood(moodEntry);
      setError("");
    } catch (err) {
      setError("Nao foi possivel carregar seus dados de hoje.");
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
    return <LoadingState message="Montando seu dia..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (!dashboard) {
    return (
      <EmptyState
        title="Sem dados do dia"
        description="Inicie uma tarefa ou uma sessao de foco para comecar."
        onAction={load}
        actionText="Recarregar"
      />
    );
  }

  const firstName = userName.split(" ")[0] || "Voce";

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.greeting, { color: colors.text }]}>Bom dia, {firstName}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>Seu painel simples para manter foco e rotina.</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: colors.cardSecondary }]}>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Foco hoje</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatDuration(dashboard.focoMinHoje)}</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.cardSecondary }]}>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Sessoes</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{dashboard.sessoesHoje}</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.cardSecondary }]}>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Streak</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{dashboard.streakAtual} dias</Text>
          </View>
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Acoes rapidas</Text>
        <View style={styles.actions}>
          <AppButton title="Comecar foco agora" onPress={() => navigation.navigate("FocusSession", { fromQuickStart: true })} />
          <AppButton title="Adicionar tarefa" onPress={() => navigation.navigate("TaskNew")} variant="secondary" />
          <AppButton
            title={showMoodForm ? "Fechar formulario de humor" : "Registrar humor e energia"}
            onPress={() => setShowMoodForm((prev) => !prev)}
            variant="ghost"
          />
          <AppButton title="Ver analise do dia" onPress={() => navigation.navigate("ProgressOverview")} variant="ghost" />
        </View>
      </AppCard>

      {showMoodForm ? (
        <AppCard>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Como voce esta hoje?</Text>
          <AppInput label="Humor (1-5)" value={humor} onChangeText={setHumor} keyboardType="numeric" />
          <AppInput label="Energia (1-5)" value={energia} onChangeText={setEnergia} keyboardType="numeric" />
          <AppInput label="Dificuldade de foco (1-5)" value={dificuldade} onChangeText={setDificuldade} keyboardType="numeric" />
          <AppInput label="Motivo de procrastinacao (opcional)" value={procrastinacao} onChangeText={setProcrastinacao} placeholder="Ex.: ansiedade" />
          <AppButton
            title="Salvar registro de hoje"
            onPress={async () => {
              try {
                await saveMoodEnergy({
                  humor: Number(humor) || 3,
                  energia: Number(energia) || 3,
                  dificuldadeFoco: Number(dificuldade) || 3,
                  procrastinacaoMotivo: procrastinacao || undefined
                });
                await load();
                setShowMoodForm(false);
              } catch (saveError) {
                Alert.alert("Falha ao salvar", "Nao foi possivel salvar humor e energia agora.");
              }
            }}
          />
        </AppCard>
      ) : null}

      <AppCard>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Tarefas pendentes</Text>
        {dashboard.pendingTasks.length === 0 ? (
          <Text style={[styles.helper, { color: colors.mutedText }]}>Sem pendencias no momento. Continue assim.</Text>
        ) : (
          dashboard.pendingTasks.map((task) => (
            <Text key={task.id} style={[styles.listItem, { color: colors.text }]}>
              • {task.titulo}
            </Text>
          ))
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Habitos de hoje</Text>
        {dashboard.habits.length === 0 ? (
          <Text style={[styles.helper, { color: colors.mutedText }]}>Crie um habito para iniciar sua rotina.</Text>
        ) : (
          dashboard.habits.map((habit) => (
            <Text key={habit.id} style={[styles.listItem, { color: colors.text }]}>
              • {habit.nome}
            </Text>
          ))
        )}
      </AppCard>

      <AppCard>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Seu estado atual</Text>
        {mood ? (
          <Text style={[styles.helper, { color: colors.text }]}>
            Humor {mood.humor}/5, energia {mood.energia}/5 e dificuldade {mood.dificuldade_foco}/5.
          </Text>
        ) : (
          <Text style={[styles.helper, { color: colors.mutedText }]}>Ainda nao registrado hoje.</Text>
        )}
      </AppCard>

      <AdBanner placement="home" onUpgrade={load} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    paddingBottom: 12
  },
  greeting: {
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 15
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800"
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8
  },
  statItem: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600"
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800"
  },
  actions: {
    gap: 10
  },
  listItem: {
    fontSize: 14
  },
  helper: {
    fontSize: 14
  }
});
