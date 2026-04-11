import { getAll, getCurrentUserId, getFirst, insert, run, updateById } from "@/db/database";
import { FocusMode, FocusSession, MoodEnergy } from "@/models/types";
import { logAction } from "@/services/historyService";
import { addFocusMinutes, addXp, refreshStreak } from "@/services/statsService";
import { nowIso } from "@/utils/date";
import { uid } from "@/utils/id";

export interface StartSessionInput {
  tarefaId?: string | null;
  objetivoId?: string | null;
  modo: FocusMode;
  duracaoPlanejadaMin: number;
}

export interface EndSessionInput {
  sessionId: string;
  concluida: boolean;
  tarefaAvancou: boolean;
  dificuldade: number;
  focoNivel: number;
  houveDistracao: boolean;
  motivoDistracaoId?: string | null;
  notaRapida?: string;
  duracaoRealSegundos: number;
}

export async function listDistractionReasons() {
  return getAll<{ id: string; nome: string }>(
    "SELECT id, nome FROM motivos_distracao WHERE ativo = 1 ORDER BY nome ASC"
  );
}

export async function startFocusSession(input: StartSessionInput) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const id = uid("foc");

  await insert("sessoes_foco", {
    id,
    usuario_id: userId,
    tarefa_id: input.tarefaId ?? null,
    objetivo_id: input.objetivoId ?? null,
    modo: input.modo,
    duracao_planejada_min: input.duracaoPlanejadaMin,
    duracao_real_segundos: 0,
    interrupcoes: 0,
    status: "em_andamento",
    started_at: now,
    ended_at: null,
    created_at: now,
    updated_at: now
  });

  await logAction("sessoes_foco", id, "iniciar", input);
  return id;
}

export async function registerInterruption(
  sessionId: string,
  motivoId?: string | null,
  descricao?: string,
  momentoSegundo?: number
) {
  const now = nowIso();
  await insert("interrupcoes", {
    id: uid("itp"),
    sessao_id: sessionId,
    motivo_id: motivoId ?? null,
    descricao: descricao ?? null,
    momento_segundo: momentoSegundo ?? 0,
    created_at: now,
    updated_at: now
  });

  await run(
    "UPDATE sessoes_foco SET interrupcoes = interrupcoes + 1, updated_at = ? WHERE id = ?",
    [now, sessionId]
  );
  await logAction("interrupcoes", sessionId, "registrar", { motivoId, descricao, momentoSegundo });
}

export async function registerPause(
  sessionId: string,
  tipo: "curta" | "longa",
  duracaoSegundos: number
) {
  const now = nowIso();
  await insert("pausas", {
    id: uid("pau"),
    sessao_id: sessionId,
    tipo,
    duracao_segundos: duracaoSegundos,
    started_at: now,
    ended_at: now,
    created_at: now,
    updated_at: now
  });
  await logAction("pausas", sessionId, "registrar", { tipo, duracaoSegundos });
}

export async function endFocusSession(input: EndSessionInput) {
  const now = nowIso();
  const status = input.concluida ? "concluida" : "interrompida";
  await updateById("sessoes_foco", input.sessionId, {
    status,
    duracao_real_segundos: input.duracaoRealSegundos,
    dificuldade: input.dificuldade,
    foco_nivel: input.focoNivel,
    houve_distracao: input.houveDistracao ? 1 : 0,
    motivo_distracao_id: input.motivoDistracaoId ?? null,
    nota_rapida: input.notaRapida ?? null,
    ended_at: now,
    updated_at: now
  });

  await logAction("sessoes_foco", input.sessionId, "encerrar", input);

  const minutes = Math.max(Math.round(input.duracaoRealSegundos / 60), 1);
  if (input.concluida) {
    await addFocusMinutes(minutes, false);
    await addXp(10 + Math.round(input.focoNivel * 1.5));
    await refreshStreak("foco", true);
  } else {
    await addFocusMinutes(0, true);
    await refreshStreak("foco", false);
  }

  if (input.tarefaAvancou) {
    await addXp(5);
  }
}

export async function createFreeSession(durationSeconds: number, titulo?: string) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  await insert("sessoes_livres", {
    id: uid("sfl"),
    usuario_id: userId,
    titulo: titulo ?? "Sessão livre",
    duracao_segundos: durationSeconds,
    started_at: now,
    ended_at: now,
    created_at: now,
    updated_at: now
  });
}

export async function listFocusSessions(limit = 100) {
  return getAll<FocusSession>(
    `
    SELECT sf.*
    FROM sessoes_foco sf
    ORDER BY sf.created_at DESC
    LIMIT ?
    `,
    [limit]
  );
}

export async function getFocusSessionById(sessionId: string) {
  return getFirst<FocusSession>("SELECT * FROM sessoes_foco WHERE id = ? LIMIT 1", [sessionId]);
}

export async function listFocusInterruptions(sessionId: string) {
  return getAll<{ id: string; descricao?: string; motivo: string; created_at: string }>(
    `
    SELECT i.id, i.descricao, COALESCE(m.nome, 'Sem motivo') as motivo, i.created_at
    FROM interrupcoes i
    LEFT JOIN motivos_distracao m ON m.id = i.motivo_id
    WHERE i.sessao_id = ?
    ORDER BY i.created_at ASC
    `,
    [sessionId]
  );
}

export async function saveMoodEnergy(input: {
  humor: number;
  energia: number;
  dificuldadeFoco: number;
  procrastinacaoMotivo?: string;
  nota?: string;
}) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const dataRef = now.slice(0, 10);
  const existing = await getFirst<{ id: string }>(
    "SELECT id FROM humor_energia WHERE usuario_id = ? AND data_ref = ? LIMIT 1",
    [userId, dataRef]
  );

  if (existing?.id) {
    await updateById("humor_energia", existing.id, {
      humor: input.humor,
      energia: input.energia,
      dificuldade_foco: input.dificuldadeFoco,
      procrastinacao_motivo: input.procrastinacaoMotivo ?? null,
      nota: input.nota ?? null,
      updated_at: now
    });
    await logAction("humor_energia", existing.id, "editar", input);
    return existing.id;
  }

  const id = uid("hme");
  await insert("humor_energia", {
    id,
    usuario_id: userId,
    data_ref: dataRef,
    humor: input.humor,
    energia: input.energia,
    dificuldade_foco: input.dificuldadeFoco,
    procrastinacao_motivo: input.procrastinacaoMotivo ?? null,
    nota: input.nota ?? null,
    created_at: now,
    updated_at: now
  });
  await logAction("humor_energia", id, "criar", input);
  return id;
}

export async function getTodayMoodEnergy() {
  const userId = await getCurrentUserId();
  const dataRef = nowIso().slice(0, 10);
  return getFirst<MoodEnergy>(
    "SELECT * FROM humor_energia WHERE usuario_id = ? AND data_ref = ? LIMIT 1",
    [userId, dataRef]
  );
}
