import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AdBanner } from "@/components/common/AdBanner";
import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StateViews";
import { useRootNavigation } from "@/navigation/hooks";
import { getRecoverableFocusSession, getTodayMoodEnergy, saveMoodEnergy } from "@/services/focusService";
import { getAdaptiveDailyFocusGoal, getConsistencyAlerts, getTodayDashboard } from "@/services/progressService";
import { replanOverdueTasks } from "@/services/taskService";
import { useAppContext } from "@/state/AppContext";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";
import { formatDuration, getGreetingByHour } from "@/utils/date";

export function TodayScreen() {
  const navigation = useRootNavigation();
  const { colors } = useTheme();
  const { userName } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof getTodayDashboard>>>();
  const [mood, setMood] = useState<Awaited<ReturnType<typeof getTodayMoodEnergy>>>();
  const [recoverable, setRecoverable] = useState<Awaited<ReturnType<typeof getRecoverableFocusSession>>>();
  const [adaptiveGoal, setAdaptiveGoal] = useState<Awaited<ReturnType<typeof getAdaptiveDailyFocusGoal>>>();
  const [consistencyAlerts, setConsistencyAlerts] = useState<string[]>([]);

  const [showMoodForm, setShowMoodForm] = useState(false);
  const [humor, setHumor] = useState("3");
  const [energia, setEnergia] = useState("3");
  const [dificuldade, setDificuldade] = useState("3");
  const [procrastinacao, setProcrastinacao] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, moodEntry, recoverableSession, adaptive, alerts] = await Promise.all([
        getTodayDashboard(),
        getTodayMoodEnergy(),
        getRecoverableFocusSession(),
        getAdaptiveDailyFocusGoal(),
        getConsistencyAlerts()
      ]);
      setDashboard(summary);
      setMood(moodEntry);
      setRecoverable(recoverableSession);
      setAdaptiveGoal(adaptive);
      setConsistencyAlerts(alerts);
      setError("");
    } catch {
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
  const greeting = getGreetingByHour();

  return (
    <View style={styles.container}>
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle="Seu centro de comando para foco, disciplina e consistencia."
        right={
          <AppButton
            title="Foco rapido"
            onPress={() => navigation.navigate("FocusSession", { fromQuickStart: true, quickDurationMin: 25 })}
            variant="secondary"
          />
        }
      />

      <AppCard tone="premium">
        <Text style={[styles.cardTitle, { color: colors.text }]}>Resumo do dia</Text>
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
        {adaptiveGoal ? (
          <Text style={[styles.helper, { color: colors.mutedText }]}>
            Meta adaptativa: {adaptiveGoal.suggestedMinutes} min (base {adaptiveGoal.baselineMinutes} min, confianca {adaptiveGoal.confidence}).
          </Text>
        ) : null}
      </AppCard>

      <AppCard>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Acoes rapidas</Text>
        <View style={styles.actions}>
          <AppButton title="Comecar foco agora" onPress={() => navigation.navigate("FocusSession", { fromQuickStart: true })} />
          <View style={styles.quickFocusRow}>
            <AppButton title="Foco 15m" onPress={() => navigation.navigate("FocusSession", { fromQuickStart: true, quickDurationMin: 15 })} variant="secondary" style={styles.quickFocusButton} />
            <AppButton title="Foco 25m" onPress={() => navigation.navigate("FocusSession", { fromQuickStart: true, quickDurationMin: 25 })} variant="secondary" style={styles.quickFocusButton} />
            <AppButton title="Foco 50m" onPress={() => navigation.navigate("FocusSession", { fromQuickStart: true, quickDurationMin: 50 })} variant="secondary" style={styles.quickFocusButton} />
          </View>
          <AppButton title="Adicionar tarefa" onPress={() => navigation.navigate("TaskNew")} variant="secondary" />
          <AppButton
            title="Check-in rapido (1 toque)"
            onPress={async () => {
              try {
                await saveMoodEnergy({
                  humor: 3,
                  energia: 3,
                  dificuldadeFoco: 3
                });
                await load();
                Alert.alert("Check-in registrado", "Humor, energia e foco salvos com valores neutros.");
              } catch {
                Alert.alert("Falha no check-in", "Nao foi possivel salvar o check-in rapido.");
              }
            }}
            variant="secondary"
          />
          {!!dashboard.overdueTasks ? (
            <AppButton
              title="Replanejar atrasadas (amanha)"
              onPress={async () => {
                try {
                  const result = await replanOverdueTasks(1, 3);
                  await load();
                  Alert.alert("Replanejamento aplicado", `${result.moved} tarefa(s) movidas para ${result.targetDate}.`);
                } catch {
                  Alert.alert("Falha no replanejamento", "Nao foi possivel replanejar as tarefas atrasadas.");
                }
              }}
              variant="secondary"
            />
          ) : null}
          {recoverable?.id ? (
            <AppButton
              title="Retomar ultima sessao interrompida"
              onPress={() =>
                navigation.navigate("FocusSession", {
                  taskId: recoverable.tarefa_id ?? undefined,
                  fromQuickStart: true,
                  quickDurationMin: recoverable.duracao_planejada_min
                })
              }
              variant="secondary"
            />
          ) : null}
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
              } catch {
                Alert.alert("Falha ao salvar", "Nao foi possivel salvar humor e energia agora.");
              }
            }}
          />
        </AppCard>
      ) : null}

      <AppCard>
        <Text style={[styles.cardTitle, { color: colors.text }]}>3 prioridades do dia</Text>
        {!!dashboard.overdueTasks ? (
          <Text style={[styles.helper, { color: colors.warning }]}>
            {dashboard.overdueTasks} tarefa(s) atrasada(s). Replaneje a mais importante.
          </Text>
        ) : null}
        {dashboard.topPriorities.length === 0 ? (
          <Text style={[styles.helper, { color: colors.mutedText }]}>Sem pendencias no momento. Continue assim.</Text>
        ) : (
          dashboard.topPriorities.map((task) => (
            <Text key={task.id} style={[styles.listItem, { color: colors.text }]}>
              - {task.titulo}
            </Text>
          ))
        )}
      </AppCard>

      <AppCard tone="soft">
        <Text style={[styles.cardTitle, { color: colors.text }]}>Sugestao inteligente de hoje</Text>
        <Text style={[styles.helper, { color: colors.text }]}>{dashboard.coachHint}</Text>
        {dashboard.bestFocusHour ? (
          <Text style={[styles.helper, { color: colors.mutedText }]}>
            Janela sugerida: {dashboard.bestFocusHour}:00 a {dashboard.bestFocusHour}:59
          </Text>
        ) : null}
      </AppCard>

      {consistencyAlerts.length > 0 ? (
        <AppCard>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Alertas preventivos</Text>
          {consistencyAlerts.map((alert) => (
            <Text key={alert} style={[styles.helper, { color: colors.warning }]}>
              - {alert}
            </Text>
          ))}
        </AppCard>
      ) : null}

      <AppCard>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Habitos de hoje</Text>
        {dashboard.habits.length === 0 ? (
          <Text style={[styles.helper, { color: colors.mutedText }]}>Crie um habito para iniciar sua rotina.</Text>
        ) : (
          dashboard.habits.map((habit) => (
            <Text key={habit.id} style={[styles.listItem, { color: colors.text }]}>
              - {habit.nome}
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
    gap: 16,
    paddingBottom: 20
  },
  cardTitle: {
    ...typography.h4
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  statItem: {
    minWidth: "30%",
    flexGrow: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4
  },
  statLabel: {
    ...typography.caption
  },
  statValue: {
    ...typography.h3
  },
  actions: {
    gap: 12
  },
  quickFocusRow: {
    flexDirection: "row",
    gap: 10
  },
  quickFocusButton: {
    flex: 1
  },
  listItem: {
    ...typography.body
  },
  helper: {
    ...typography.body
  }
});
