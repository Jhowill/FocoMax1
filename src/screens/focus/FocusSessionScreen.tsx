import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { FocusModePicker } from "@/components/focus/FocusModePicker";
import { TimerDisplay } from "@/components/focus/TimerDisplay";
import { RootStackParamList } from "@/navigation/types";
import { listObjectives } from "@/services/catalogService";
import {
  createFreeSession,
  endFocusSession,
  listDistractionReasons,
  registerInterruption,
  registerPause,
  startFocusSession
} from "@/services/focusService";
import { evaluateAchievements } from "@/services/gamificationService";
import { listTasks } from "@/services/taskService";
import { useTheme } from "@/theme/ThemeProvider";
import { FocusMode } from "@/models/types";

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
  "Respire fundo e foque em uma única próxima ação.",
  "Modo foco ativado: presença total nos próximos minutos.",
  "Você não precisa perfeição, só consistência."
];

const encouragementAfter = [
  "Boa sessão. Cada bloco concluído reforça sua disciplina.",
  "Você está acumulando progresso real.",
  "Persistência pequena hoje vira resultado grande depois."
];

export function FocusSessionScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const taskIdFromRoute = route.params?.taskId;

  const [tasks, setTasks] = useState<Array<{ id: string; titulo: string }>>([]);
  const [objectives, setObjectives] = useState<Array<{ id: string; titulo: string }>>([]);
  const [reasons, setReasons] = useState<Array<{ id: string; nome: string }>>([]);

  const [mode, setMode] = useState<FocusMode>("pomodoro_classico");
  const [durationMinutes, setDurationMinutes] = useState("25");
  const [selectedTaskId, setSelectedTaskId] = useState(taskIdFromRoute ?? "");
  const [selectedObjectiveId, setSelectedObjectiveId] = useState("");
  const [sound, setSound] = useState("campainha_1");
  const [deepMode, setDeepMode] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [lastMessage, setLastMessage] = useState(encouragementBefore[0]);

  const [finishDraft, setFinishDraft] = useState<FinishDraft>({
    concluida: true,
    tarefaAvancou: true,
    dificuldade: "3",
    focoNivel: "4",
    houveDistracao: false,
    motivoDistracaoId: "",
    notaRapida: ""
  });

  useEffect(() => {
    Promise.all([listTasks({ periodo: "todas" }), listObjectives(), listDistractionReasons()]).then(
      ([taskRows, objectiveRows, reasonRows]) => {
        setTasks(taskRows.map((task) => ({ id: task.id, titulo: task.titulo })));
        setObjectives(objectiveRows);
        setReasons(reasonRows);
        if (!finishDraft.motivoDistracaoId && reasonRows[0]?.id) {
          setFinishDraft((prev) => ({ ...prev, motivoDistracaoId: reasonRows[0].id }));
        }
      }
    );
  }, []);

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
  }, [secondsLeft, isRunning]);

  useEffect(() => {
    const minutes = Number(durationMinutes) || 25;
    if (!isRunning) {
      setSecondsLeft(minutes * 60);
      setElapsedSeconds(0);
    }
  }, [durationMinutes, isRunning]);

  const currentTask = useMemo(() => tasks.find((task) => task.id === selectedTaskId), [tasks, selectedTaskId]);

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
    setLastMessage(encouragementBefore[Math.floor(Math.random() * encouragementBefore.length)]);
  };

  const handlePause = async () => {
    if (!isRunning || isPaused) {
      return;
    }
    setIsPaused(true);
    if (sessionId) {
      await registerPause(sessionId, "curta", 0);
    }
  };

  const handleLongPause = async () => {
    if (!isRunning) {
      return;
    }
    setIsPaused(true);
    if (sessionId) {
      await registerPause(sessionId, "longa", 0);
    }
  };

  const handleResume = () => {
    if (!isRunning || !isPaused) {
      return;
    }
    setIsPaused(false);
  };

  const handleInterrupt = async () => {
    if (!sessionId) {
      return;
    }
    const reason = reasons[0];
    await registerInterruption(sessionId, reason?.id, "Interrupção manual", elapsedSeconds);
    setInterruptions((prev) => prev + 1);
    setFinishDraft((prev) => ({ ...prev, houveDistracao: true, motivoDistracaoId: reason?.id ?? prev.motivoDistracaoId }));
  };

  const handleEnd = async (autoConcluded = false) => {
    if (!isRunning) {
      return;
    }
    setIsRunning(false);
    setIsPaused(false);
    setShowSummary(true);
    setFinishDraft((prev) => ({
      ...prev,
      concluida: autoConcluded ? true : prev.concluida
    }));
    setLastMessage(encouragementAfter[Math.floor(Math.random() * encouragementAfter.length)]);
  };

  const finishAndSave = async () => {
    if (!sessionId) {
      Alert.alert("Sessão inválida", "Inicie uma sessão antes de finalizar.");
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
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Sessão de foco</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>{lastMessage}</Text>

        <FocusModePicker
          selected={mode}
          onSelect={(selected, suggestedMin) => {
            setMode(selected);
            setDurationMinutes(`${suggestedMin}`);
          }}
        />
        <AppInput
          label="Duração (min)"
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          keyboardType="numeric"
          editable={!isRunning}
        />

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
          <Pressable
            onPress={() => setDeepMode((prev) => !prev)}
            style={[styles.pill, { borderColor: deepMode ? colors.primary : colors.border }]}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>{deepMode ? "Modo profundo ativado" : "Ativar modo profundo"}</Text>
          </Pressable>
          <Pressable
            onPress={() => setSound((prev) => (prev === "campainha_1" ? "campainha_2" : "campainha_1"))}
            style={[styles.pill, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>Som: {sound}</Text>
          </Pressable>
        </View>

        <TimerDisplay
          seconds={secondsLeft}
          label={currentTask ? `Tarefa atual: ${currentTask.titulo}` : "Sem tarefa vinculada"}
          interruptions={interruptions}
        />
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Controles</Text>
        <View style={styles.actions}>
          <AppButton title="Iniciar" onPress={handleStart} disabled={isRunning} />
          <AppButton title="Pausar" onPress={handlePause} disabled={!isRunning || isPaused} variant="secondary" />
          <AppButton title="Pausa longa" onPress={handleLongPause} disabled={!isRunning} variant="secondary" />
          <AppButton title="Retomar" onPress={handleResume} disabled={!isRunning || !isPaused} variant="secondary" />
          <AppButton title="Marcar distração" onPress={handleInterrupt} disabled={!isRunning} variant="secondary" />
          <AppButton title="Preciso parar" onPress={() => handleEnd(false)} disabled={!isRunning} variant="secondary" />
          <AppButton
            title="Concluí a tarefa"
            onPress={() => {
              setFinishDraft((prev) => ({ ...prev, tarefaAvancou: true }));
              handleEnd(true);
            }}
            disabled={!isRunning}
            variant="secondary"
          />
          <AppButton title="Encerrar" onPress={() => handleEnd(false)} disabled={!isRunning} variant="danger" />
          <AppButton title="Abrir histórico de sessões" onPress={() => navigation.navigate("FocusHistory")} variant="ghost" />
        </View>
      </AppCard>

      {showSummary ? (
        <AppCard>
          <Text style={[styles.title, { color: colors.text }]}>Resumo da sessão</Text>
          <Text style={{ color: colors.mutedText, fontSize: 13 }}>Sessão concluída?</Text>
          <View style={styles.inlineWrap}>
            <Pressable
              onPress={() => setFinishDraft((prev) => ({ ...prev, concluida: true }))}
              style={[styles.pill, { borderColor: finishDraft.concluida ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text }}>Sim</Text>
            </Pressable>
            <Pressable
              onPress={() => setFinishDraft((prev) => ({ ...prev, concluida: false }))}
              style={[styles.pill, { borderColor: !finishDraft.concluida ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text }}>Não</Text>
            </Pressable>
          </View>

          <Text style={{ color: colors.mutedText, fontSize: 13 }}>Tarefa avançou?</Text>
          <View style={styles.inlineWrap}>
            <Pressable
              onPress={() => setFinishDraft((prev) => ({ ...prev, tarefaAvancou: true }))}
              style={[styles.pill, { borderColor: finishDraft.tarefaAvancou ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text }}>Sim</Text>
            </Pressable>
            <Pressable
              onPress={() => setFinishDraft((prev) => ({ ...prev, tarefaAvancou: false }))}
              style={[styles.pill, { borderColor: !finishDraft.tarefaAvancou ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text }}>Não</Text>
            </Pressable>
          </View>

          <AppInput
            label="Nível de dificuldade (1-5)"
            value={finishDraft.dificuldade}
            onChangeText={(text) => setFinishDraft((prev) => ({ ...prev, dificuldade: text }))}
            keyboardType="numeric"
          />
          <AppInput
            label="Nível de foco (1-5)"
            value={finishDraft.focoNivel}
            onChangeText={(text) => setFinishDraft((prev) => ({ ...prev, focoNivel: text }))}
            keyboardType="numeric"
          />

          <Text style={{ color: colors.mutedText, fontSize: 13 }}>Houve distração?</Text>
          <View style={styles.inlineWrap}>
            <Pressable
              onPress={() => setFinishDraft((prev) => ({ ...prev, houveDistracao: true }))}
              style={[styles.pill, { borderColor: finishDraft.houveDistracao ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text }}>Sim</Text>
            </Pressable>
            <Pressable
              onPress={() => setFinishDraft((prev) => ({ ...prev, houveDistracao: false }))}
              style={[styles.pill, { borderColor: !finishDraft.houveDistracao ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text }}>Não</Text>
            </Pressable>
          </View>

          {finishDraft.houveDistracao ? (
            <>
              <Text style={{ color: colors.mutedText, fontSize: 13 }}>Motivo principal da distração</Text>
              <View style={styles.inlineWrap}>
                {reasons.map((reason) => (
                  <Pressable
                    key={reason.id}
                    onPress={() => setFinishDraft((prev) => ({ ...prev, motivoDistracaoId: reason.id }))}
                    style={[styles.pill, { borderColor: finishDraft.motivoDistracaoId === reason.id ? colors.primary : colors.border }]}
                  >
                    <Text style={{ color: colors.text, fontSize: 12 }}>{reason.nome}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <AppInput
            label="Nota rápida (opcional)"
            value={finishDraft.notaRapida}
            onChangeText={(text) => setFinishDraft((prev) => ({ ...prev, notaRapida: text }))}
            multiline
          />

          <AppButton title="Salvar sessão localmente" onPress={finishAndSave} />
        </AppCard>
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
    fontSize: 20,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "800"
  },
  actions: {
    gap: 8
  },
  inlineWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 32,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center"
  }
});
