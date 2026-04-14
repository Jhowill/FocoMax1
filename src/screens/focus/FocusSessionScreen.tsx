import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { FocusModePicker } from "@/components/focus/FocusModePicker";
import { TimerDisplay } from "@/components/focus/TimerDisplay";
import { FocusMode } from "@/models/types";
import { RootStackParamList } from "@/navigation/types";
import { listObjectives } from "@/services/catalogService";
import {
  createFreeSession,
  endFocusSession,
  getSmartBreakRecommendation,
  listDistractionReasons,
  listFavoriteDistractionReasons,
  registerInterruption,
  registerPause,
  startFocusSession
} from "@/services/focusService";
import { evaluateAchievements } from "@/services/gamificationService";
import { getBoolPref } from "@/services/localPrefsService";
import { openPlatformFocusSettings } from "@/services/systemIntegrationService";
import { listTasks } from "@/services/taskService";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "FocusSession">;

type FinishDraft = {
  concluida: boolean;
  tarefaAvancou: boolean;
  dificuldade: string;
  focoNivel: string;
  houveDistracao: boolean;
  motivoDistracaoId: string;
  notaRapida: string;
};

const encouragementBefore = [
  "Respire fundo e execute apenas o proximo passo.",
  "Modo foco ativado: progresso real nos proximos minutos.",
  "Consistencia vence perfeicao. Comece agora."
];

const encouragementAfter = [
  "Boa sessao. Seu ritmo esta ficando mais forte.",
  "Excelente trabalho. Voce transformou intencao em execucao.",
  "Mais um bloco concluido. Continue nesse compasso."
];

export function FocusSessionScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const taskIdFromRoute = route.params?.taskId;
  const quickDurationMin = route.params?.quickDurationMin;

  const [tasks, setTasks] = useState<{ id: string; titulo: string }[]>([]);
  const [objectives, setObjectives] = useState<{ id: string; titulo: string }[]>([]);
  const [reasons, setReasons] = useState<{ id: string; nome: string }[]>([]);
  const [favoriteReasons, setFavoriteReasons] = useState<{ id: string; nome: string; total: number }[]>([]);

  const [mode, setMode] = useState<FocusMode>("pomodoro_classico");
  const [durationMinutes, setDurationMinutes] = useState(`${Math.max(5, quickDurationMin ?? 25)}`);
  const [selectedTaskId, setSelectedTaskId] = useState(taskIdFromRoute ?? "");
  const [selectedObjectiveId, setSelectedObjectiveId] = useState("");
  const [sound, setSound] = useState("campainha_1");
  const [deepMode, setDeepMode] = useState(false);
  const [focusShieldEnabled, setFocusShieldEnabled] = useState(false);
  const [iosFocusHintEnabled, setIosFocusHintEnabled] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.max(5, quickDurationMin ?? 25) * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [lastMessage, setLastMessage] = useState(encouragementBefore[0]);
  const [loadError, setLoadError] = useState("");
  const [showAbandonRecovery, setShowAbandonRecovery] = useState(false);
  const [smartBreak, setSmartBreak] = useState<{ minutes: number; type: "curta" | "longa"; reason: string }>({
    minutes: 5,
    type: "curta",
    reason: "Pausa curta recomendada para manter consistencia."
  });

  const [finishDraft, setFinishDraft] = useState<FinishDraft>({
    concluida: true,
    tarefaAvancou: true,
    dificuldade: "3",
    focoNivel: "4",
    houveDistracao: false,
    motivoDistracaoId: "",
    notaRapida: ""
  });

  const appStateRef = useRef(AppState.currentState);
  const backgroundAtRef = useRef<number | null>(null);

  const refreshOptions = useCallback(async () => {
    try {
      const [taskRows, objectiveRows, reasonRows, favoriteRows, smart, shield, iosHint] = await Promise.all([
        listTasks({ periodo: "todas" }),
        listObjectives(),
        listDistractionReasons(),
        listFavoriteDistractionReasons(4),
        getSmartBreakRecommendation(),
        getBoolPref("focus_shield_enabled"),
        getBoolPref("ios_focus_hint_enabled")
      ]);

      setTasks(taskRows.map((task) => ({ id: task.id, titulo: task.titulo })));
      setObjectives(objectiveRows);
      setReasons(reasonRows);
      setFavoriteReasons(favoriteRows);
      setSmartBreak(smart);
      setFocusShieldEnabled(shield);
      setIosFocusHintEnabled(iosHint);
      if (reasonRows[0]?.id) {
        setFinishDraft((prev) => (prev.motivoDistracaoId ? prev : { ...prev, motivoDistracaoId: reasonRows[0].id }));
      }
      setLoadError("");
    } catch {
      setLoadError("Nao foi possivel carregar opcoes de foco.");
    }
  }, []);

  const handleEnd = useCallback((autoConcluded = false) => {
    setIsRunning((prevRunning) => {
      if (!prevRunning) {
        return prevRunning;
      }

      setIsPaused(false);
      setShowSummary(true);
      setShowAbandonRecovery(false);
      setFinishDraft((prev) => ({
        ...prev,
        concluida: autoConcluded ? true : prev.concluida
      }));
      setLastMessage(encouragementAfter[Math.floor(Math.random() * encouragementAfter.length)]);
      return false;
    });
  }, []);

  useEffect(() => {
    refreshOptions();
  }, [refreshOptions]);

  useEffect(() => {
    if (!isRunning && quickDurationMin && quickDurationMin > 0) {
      const normalized = Math.max(5, quickDurationMin);
      setDurationMinutes(`${normalized}`);
      setSecondsLeft(normalized * 60);
    }
  }, [quickDurationMin, isRunning]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => Math.max(prev - 1, 0));
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      handleEnd(true);
    }
  }, [secondsLeft, isRunning, handleEnd]);

  useEffect(() => {
    const minutes = Number(durationMinutes) || 25;
    if (!isRunning) {
      setSecondsLeft(minutes * 60);
      setElapsedSeconds(0);
    }
  }, [durationMinutes, isRunning]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (!isRunning || !deepMode || !focusShieldEnabled || !sessionId) {
        return;
      }

      if (prevState === "active" && (nextState === "inactive" || nextState === "background")) {
        backgroundAtRef.current = Date.now();
        return;
      }

      if ((prevState === "inactive" || prevState === "background") && nextState === "active") {
        const awaySeconds = Math.round((Date.now() - (backgroundAtRef.current ?? Date.now())) / 1000);
        backgroundAtRef.current = null;

        if (awaySeconds >= 20) {
          const reasonId = favoriteReasons[0]?.id ?? reasons[0]?.id;
          setShowAbandonRecovery(true);
          setIsPaused(true);
          setInterruptions((prev) => prev + 1);
          setFinishDraft((prev) => ({
            ...prev,
            houveDistracao: true,
            motivoDistracaoId: reasonId ?? prev.motivoDistracaoId
          }));

          void registerInterruption(sessionId, reasonId, `Saiu do app por ${awaySeconds}s`, elapsedSeconds);
        }
      }
    });

    return () => subscription.remove();
  }, [isRunning, deepMode, focusShieldEnabled, sessionId, elapsedSeconds, favoriteReasons, reasons]);

  const currentTask = useMemo(() => tasks.find((task) => task.id === selectedTaskId), [tasks, selectedTaskId]);
  const minimalDeepControls = deepMode && isRunning;

  const handleStart = async () => {
    if (isRunning) {
      return;
    }
    const plannedMin = Math.max(5, Number(durationMinutes) || 25);
    const createdSessionId = await startFocusSession({
      tarefaId: selectedTaskId || undefined,
      objetivoId: selectedObjectiveId || undefined,
      modo: mode,
      duracaoPlanejadaMin: plannedMin
    });
    setSessionId(createdSessionId);
    setIsRunning(true);
    setIsPaused(false);
    setSecondsLeft(plannedMin * 60);
    setElapsedSeconds(0);
    setInterruptions(0);
    setShowAbandonRecovery(false);
    setLastMessage(encouragementBefore[Math.floor(Math.random() * encouragementBefore.length)]);
  };

  const handlePause = async (type: "curta" | "longa" = "curta", durationSeconds = 0) => {
    if (!isRunning || isPaused) {
      return;
    }
    setIsPaused(true);
    if (sessionId) {
      await registerPause(sessionId, type, durationSeconds);
    }
  };

  const handleSmartBreak = async () => {
    if (!isRunning) {
      return;
    }
    await handlePause(smartBreak.type, smartBreak.minutes * 60);
    Alert.alert("Pausa inteligente", `${smartBreak.minutes} min. ${smartBreak.reason}`);
  };

  const handleResume = () => {
    if (!isRunning || !isPaused) {
      return;
    }
    setIsPaused(false);
    setShowAbandonRecovery(false);
  };

  const handleInterrupt = async (reasonId?: string) => {
    if (!sessionId) {
      return;
    }
    const selectedReasonId = reasonId ?? favoriteReasons[0]?.id ?? reasons[0]?.id;
    await registerInterruption(sessionId, selectedReasonId, "Interrupcao manual", elapsedSeconds);
    setInterruptions((prev) => prev + 1);
    setFinishDraft((prev) => ({
      ...prev,
      houveDistracao: true,
      motivoDistracaoId: selectedReasonId ?? prev.motivoDistracaoId
    }));
  };

  const finishAndSave = async () => {
    if (!sessionId) {
      Alert.alert("Sessao invalida", "Inicie uma sessao antes de finalizar.");
      return;
    }

    await endFocusSession({
      sessionId,
      concluida: finishDraft.concluida,
      tarefaAvancou: finishDraft.tarefaAvancou,
      dificuldade: Number(finishDraft.dificuldade) || 3,
      focoNivel: Number(finishDraft.focoNivel) || 3,
      houveDistracao: finishDraft.houveDistracao,
      motivoDistracaoId: finishDraft.houveDistracao ? finishDraft.motivoDistracaoId : null,
      notaRapida: finishDraft.notaRapida,
      duracaoRealSegundos: elapsedSeconds
    });

    if (mode === "foco_livre") {
      await createFreeSession(elapsedSeconds, currentTask?.titulo ?? "Foco livre");
    }

    await evaluateAchievements();
    setShowSummary(false);
    navigation.replace("FocusSummary", { id: sessionId });
  };

  return (
    <View style={styles.container}>
      <AppCard tone="premium">
        <Text style={[styles.title, { color: colors.text }]}>Sessao de foco</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>{lastMessage}</Text>
        {loadError ? <Text style={{ color: colors.danger, fontSize: 12 }}>{loadError}</Text> : null}

        <FocusModePicker
          selected={mode}
          onSelect={(selected, suggestedMin) => {
            setMode(selected);
            setDurationMinutes(`${suggestedMin}`);
          }}
        />

        <AppInput label="Duracao (min)" value={durationMinutes} onChangeText={setDurationMinutes} keyboardType="numeric" editable={!isRunning} />
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>Atalhos de foco rapido</Text>
        <View style={styles.inlineWrap}>
          {[15, 25, 50].map((preset) => (
            <Pressable
              key={preset}
              onPress={() => !isRunning && setDurationMinutes(`${preset}`)}
              style={[styles.pill, { borderColor: Number(durationMinutes) === preset ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>{preset} min</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: colors.mutedText, fontSize: 13 }}>Tarefa vinculada</Text>
        <View style={styles.inlineWrap}>
          {tasks.slice(0, 10).map((task) => (
            <Pressable
              key={task.id}
              onPress={() => setSelectedTaskId(task.id)}
              style={[styles.pill, { borderColor: selectedTaskId === task.id ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>{task.titulo}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: colors.mutedText, fontSize: 13 }}>Objetivo</Text>
        <View style={styles.inlineWrap}>
          {objectives.slice(0, 8).map((objective) => (
            <Pressable
              key={objective.id}
              onPress={() => setSelectedObjectiveId(objective.id)}
              style={[styles.pill, { borderColor: selectedObjectiveId === objective.id ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>{objective.titulo}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.inlineWrap}>
          <Pressable onPress={() => setDeepMode((prev) => !prev)} style={[styles.pill, { borderColor: deepMode ? colors.primary : colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 12 }}>{deepMode ? "Modo profundo ligado" : "Ativar modo profundo"}</Text>
          </Pressable>
          <Pressable onPress={() => setSound((prev) => (prev === "campainha_1" ? "campainha_2" : "campainha_1"))} style={[styles.pill, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 12 }}>Som: {sound}</Text>
          </Pressable>
          <Pressable onPress={handleSmartBreak} style={[styles.pill, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 12 }}>Pausa inteligente: {smartBreak.minutes}m</Text>
          </Pressable>
        </View>

        {deepMode && focusShieldEnabled ? (
          <Text style={{ color: colors.warning, fontSize: 12 }}>
            Protecao anti-distracao ativa: sair do app por mais de 20s pausa a sessao e registra interrupcao.
          </Text>
        ) : null}
        {deepMode && Platform.OS === "ios" && iosFocusHintEnabled ? (
          <AppButton
            title="Abrir ajustes de foco do iOS"
            onPress={openPlatformFocusSettings}
            variant="ghost"
          />
        ) : null}
        {deepMode && Platform.OS === "android" && focusShieldEnabled ? (
          <AppButton
            title="Abrir ajustes de protecao Android"
            onPress={openPlatformFocusSettings}
            variant="ghost"
          />
        ) : null}

        <TimerDisplay
          seconds={secondsLeft}
          label={currentTask ? `Tarefa atual: ${currentTask.titulo}` : "Sem tarefa vinculada"}
          interruptions={interruptions}
        />
      </AppCard>

      {showAbandonRecovery ? (
        <AppCard tone="soft">
          <Text style={[styles.subtitle, { color: colors.text }]}>Sessao pausada por abandono</Text>
          <Text style={{ color: colors.mutedText, fontSize: 13 }}>
            Detectamos saida do app durante foco profundo. Deseja retomar agora?
          </Text>
          <View style={styles.actions}>
            <AppButton title="Retomar sessao" onPress={handleResume} />
            <AppButton title="Encerrar e salvar" onPress={() => handleEnd(false)} variant="secondary" />
          </View>
        </AppCard>
      ) : null}

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Controles</Text>
        {minimalDeepControls ? (
          <View style={styles.actions}>
            <AppButton title="Pausar" onPress={() => handlePause("curta", 0)} disabled={!isRunning || isPaused} variant="secondary" />
            <AppButton title="Retomar" onPress={handleResume} disabled={!isRunning || !isPaused} variant="secondary" />
            <AppButton title="Interrupcao" onPress={() => handleInterrupt()} disabled={!isRunning} variant="secondary" />
            <AppButton title="Encerrar" onPress={() => handleEnd(false)} disabled={!isRunning} variant="danger" />
          </View>
        ) : (
          <View style={styles.actions}>
            <AppButton title="Iniciar" onPress={handleStart} disabled={isRunning} />
            <AppButton title="Pausar" onPress={() => handlePause("curta", 0)} disabled={!isRunning || isPaused} variant="secondary" />
            <AppButton title="Pausa longa" onPress={() => handlePause("longa", 0)} disabled={!isRunning} variant="secondary" />
            <AppButton title="Retomar" onPress={handleResume} disabled={!isRunning || !isPaused} variant="secondary" />
            <AppButton title="Marcar distracao" onPress={() => handleInterrupt()} disabled={!isRunning} variant="secondary" />
            {favoriteReasons.length > 0 ? (
              <View style={styles.inlineWrap}>
                {favoriteReasons.map((reason) => (
                  <Pressable key={reason.id} onPress={() => handleInterrupt(reason.id)} style={[styles.pill, { borderColor: colors.border }]}>
                    <Text style={{ color: colors.text, fontSize: 12 }}>{reason.nome}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <AppButton
              title="Conclui a tarefa"
              onPress={() => {
                setFinishDraft((prev) => ({ ...prev, tarefaAvancou: true }));
                handleEnd(true);
              }}
              disabled={!isRunning}
              variant="secondary"
            />
            <AppButton title="Encerrar" onPress={() => handleEnd(false)} disabled={!isRunning} variant="danger" />
            <AppButton title="Historico de sessoes" onPress={() => navigation.navigate("FocusHistory")} variant="ghost" />
          </View>
        )}
      </AppCard>

      {showSummary ? (
        <AppCard tone="soft">
          <Text style={[styles.title, { color: colors.text }]}>Resumo da sessao</Text>
          <Text style={{ color: colors.mutedText, fontSize: 13 }}>Sessao concluida?</Text>
          <View style={styles.inlineWrap}>
            <Pressable onPress={() => setFinishDraft((prev) => ({ ...prev, concluida: true }))} style={[styles.pill, { borderColor: finishDraft.concluida ? colors.primary : colors.border }]}>
              <Text style={{ color: colors.text }}>Sim</Text>
            </Pressable>
            <Pressable onPress={() => setFinishDraft((prev) => ({ ...prev, concluida: false }))} style={[styles.pill, { borderColor: !finishDraft.concluida ? colors.primary : colors.border }]}>
              <Text style={{ color: colors.text }}>Nao</Text>
            </Pressable>
          </View>

          <Text style={{ color: colors.mutedText, fontSize: 13 }}>Tarefa avancou?</Text>
          <View style={styles.inlineWrap}>
            <Pressable onPress={() => setFinishDraft((prev) => ({ ...prev, tarefaAvancou: true }))} style={[styles.pill, { borderColor: finishDraft.tarefaAvancou ? colors.primary : colors.border }]}>
              <Text style={{ color: colors.text }}>Sim</Text>
            </Pressable>
            <Pressable onPress={() => setFinishDraft((prev) => ({ ...prev, tarefaAvancou: false }))} style={[styles.pill, { borderColor: !finishDraft.tarefaAvancou ? colors.primary : colors.border }]}>
              <Text style={{ color: colors.text }}>Nao</Text>
            </Pressable>
          </View>

          <AppInput label="Dificuldade (1-5)" value={finishDraft.dificuldade} onChangeText={(text) => setFinishDraft((prev) => ({ ...prev, dificuldade: text }))} keyboardType="numeric" />
          <AppInput label="Nivel de foco (1-5)" value={finishDraft.focoNivel} onChangeText={(text) => setFinishDraft((prev) => ({ ...prev, focoNivel: text }))} keyboardType="numeric" />

          <Text style={{ color: colors.mutedText, fontSize: 13 }}>Houve distracao?</Text>
          <View style={styles.inlineWrap}>
            <Pressable onPress={() => setFinishDraft((prev) => ({ ...prev, houveDistracao: true }))} style={[styles.pill, { borderColor: finishDraft.houveDistracao ? colors.primary : colors.border }]}>
              <Text style={{ color: colors.text }}>Sim</Text>
            </Pressable>
            <Pressable onPress={() => setFinishDraft((prev) => ({ ...prev, houveDistracao: false }))} style={[styles.pill, { borderColor: !finishDraft.houveDistracao ? colors.primary : colors.border }]}>
              <Text style={{ color: colors.text }}>Nao</Text>
            </Pressable>
          </View>

          {finishDraft.houveDistracao ? (
            <>
              <Text style={{ color: colors.mutedText, fontSize: 13 }}>Motivo principal</Text>
              <View style={styles.inlineWrap}>
                {reasons.map((reason) => (
                  <Pressable key={reason.id} onPress={() => setFinishDraft((prev) => ({ ...prev, motivoDistracaoId: reason.id }))} style={[styles.pill, { borderColor: finishDraft.motivoDistracaoId === reason.id ? colors.primary : colors.border }]}>
                    <Text style={{ color: colors.text, fontSize: 12 }}>{reason.nome}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <AppInput label="Nota rapida (opcional)" value={finishDraft.notaRapida} onChangeText={(text) => setFinishDraft((prev) => ({ ...prev, notaRapida: text }))} multiline />
          <AppButton title="Salvar sessao" onPress={finishAndSave} />
        </AppCard>
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
    ...typography.h3
  },
  subtitle: {
    ...typography.subtitle
  },
  actions: {
    gap: 10
  },
  inlineWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
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
