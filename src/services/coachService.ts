import { getAll, getCurrentUserId, getFirst, insert, run, updateById } from "@/db/database";
import { Suggestion } from "@/models/types";
import { nowIso, toDateKey } from "@/utils/date";
import { uid } from "@/utils/id";

export async function listCoachSuggestions() {
  const userId = await getCurrentUserId();
  return getAll<Suggestion>(
    `
    SELECT id, texto, tipo, util_status, created_at, updated_at
    FROM sugestoes_coach
    WHERE usuario_id = ? AND is_ativa = 1
    ORDER BY created_at DESC
    `,
    [userId]
  );
}

export async function setSuggestionFeedback(id: string, status: "util" | "ignorado" | "favorita") {
  await updateById("sugestoes_coach", id, {
    util_status: status,
    updated_at: nowIso()
  });
}

export async function dismissSuggestion(id: string) {
  await updateById("sugestoes_coach", id, {
    is_ativa: 0,
    updated_at: nowIso()
  });
}

export async function regenerateSuggestions() {
  const userId = await getCurrentUserId();
  await run("DELETE FROM sugestoes_coach WHERE usuario_id = ?", [userId]);

  const now = nowIso();
  const suggestions: { tipo: string; texto: string }[] = [];

  const bestHour = await getFirst<{ hora: string; media_foco: number }>(
    `
    SELECT strftime('%H', started_at) as hora, AVG(foco_nivel) as media_foco
    FROM sessoes_foco
    WHERE usuario_id = ? AND status = 'concluida'
    GROUP BY strftime('%H', started_at)
    ORDER BY media_foco DESC
    LIMIT 1
    `,
    [userId]
  );
  if (bestHour?.hora) {
    suggestions.push({
      tipo: "horario_otimo",
      texto: `Seu melhor foco recente acontece por volta de ${bestHour.hora}h. Priorize tarefas exigentes nesse horário.`
    });
  }

  const interruptionByDuration = await getFirst<{ longas: number; curtas: number }>(
    `
    SELECT
      SUM(CASE WHEN duracao_planejada_min >= 45 AND status = 'interrompida' THEN 1 ELSE 0 END) as longas,
      SUM(CASE WHEN duracao_planejada_min < 45 AND status = 'interrompida' THEN 1 ELSE 0 END) as curtas
    FROM sessoes_foco
    WHERE usuario_id = ?
    `,
    [userId]
  );
  if ((interruptionByDuration?.longas ?? 0) > (interruptionByDuration?.curtas ?? 0)) {
    suggestions.push({
      tipo: "duracao_sessao",
      texto: "Você interrompe mais sessões longas. Teste blocos de 25 a 35 minutos para manter consistência."
    });
  }

  const moodImpact = await getFirst<{ baixa_energia: number; alta_energia: number }>(
    `
    SELECT
      AVG(CASE WHEN he.energia <= 2 THEN sf.foco_nivel END) as baixa_energia,
      AVG(CASE WHEN he.energia >= 4 THEN sf.foco_nivel END) as alta_energia
    FROM humor_energia he
    LEFT JOIN sessoes_foco sf
      ON sf.usuario_id = he.usuario_id
      AND date(sf.started_at) = date(he.data_ref)
    WHERE he.usuario_id = ?
    `,
    [userId]
  );
  if ((moodImpact?.alta_energia ?? 0) - (moodImpact?.baixa_energia ?? 0) >= 1) {
    suggestions.push({
      tipo: "energia",
      texto: "Seu desempenho sobe quando sua energia está alta. Faça uma rotina curta de ativação antes de focar."
    });
  }

  const distractionTop = await getFirst<{ motivo: string; total: number }>(
    `
    SELECT COALESCE(md.nome, 'Sem motivo') as motivo, COUNT(*) as total
    FROM sessoes_foco sf
    LEFT JOIN motivos_distracao md ON md.id = sf.motivo_distracao_id
    WHERE sf.usuario_id = ? AND sf.houve_distracao = 1
    GROUP BY COALESCE(md.nome, 'Sem motivo')
    ORDER BY total DESC
    LIMIT 1
    `,
    [userId]
  );
  if (distractionTop?.motivo) {
    suggestions.push({
      tipo: "distracao",
      texto: `Seu principal gatilho de distração é "${distractionTop.motivo}". Defina uma regra de bloqueio para esse gatilho antes da sessão.`
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      tipo: "inicio",
      texto: "Comece com sessões rápidas de 15 minutos para criar ritmo e aumentar sua consistência diária."
    });
  }

  for (const suggestion of suggestions.slice(0, 6)) {
    await insert("sugestoes_coach", {
      id: uid("csg"),
      usuario_id: userId,
      tipo: suggestion.tipo,
      texto: suggestion.texto,
      util_status: "pendente",
      is_ativa: 1,
      created_at: now,
      updated_at: now
    });
  }

  return listCoachSuggestions();
}

export async function generateAdvancedWeeklyPlan() {
  const userId = await getCurrentUserId();
  const [criticalTasks, habits, bestHour, recentStats] = await Promise.all([
    getAll<{ titulo: string; prioridade: number }>(
      `
      SELECT titulo, prioridade
      FROM tarefas
      WHERE usuario_id = ?
        AND is_archived = 0
        AND status <> 'concluida'
      ORDER BY prioridade DESC, date(data_prevista) ASC
      LIMIT 7
      `,
      [userId]
    ),
    getAll<{ nome: string; melhor_horario?: string | null }>(
      `
      SELECT nome, melhor_horario
      FROM habitos
      WHERE usuario_id = ?
        AND ativo = 1
        AND is_archived = 0
      ORDER BY created_at DESC
      LIMIT 7
      `,
      [userId]
    ),
    getFirst<{ hora: string }>(
      `
      SELECT strftime('%H', started_at) as hora
      FROM sessoes_foco
      WHERE usuario_id = ?
        AND status = 'concluida'
      GROUP BY strftime('%H', started_at)
      ORDER BY AVG(COALESCE(foco_nivel, 3)) DESC, COUNT(*) DESC
      LIMIT 1
      `,
      [userId]
    ),
    getAll<{ foco_min: number }>(
      `
      SELECT foco_min
      FROM estatisticas_diarias
      WHERE usuario_id = ?
      ORDER BY data_ref DESC
      LIMIT 7
      `,
      [userId]
    )
  ]);

  const baseFocus = Math.max(
    25,
    Math.round(recentStats.reduce((sum, row) => sum + (row.foco_min ?? 0), 0) / Math.max(recentStats.length, 1))
  );
  const bestWindow = bestHour?.hora ? `${bestHour.hora}:00 - ${bestHour.hora}:59` : "08:00 - 10:00";

  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(Date.now() + index * 86400000);
    const dateRef = toDateKey(date);
    const task = criticalTasks[index % Math.max(criticalTasks.length, 1)];
    const habit = habits[index % Math.max(habits.length, 1)];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const focusTarget = Math.max(20, baseFocus + (isWeekend ? -10 : 5));

    return {
      dateRef,
      focusTarget,
      priorityTask: task?.titulo ?? "Revisar backlog e definir prioridade do dia",
      habitFocus: habit?.nome ?? "Habito principal do dia",
      suggestedWindow: habit?.melhor_horario || bestWindow
    };
  });

  return {
    generatedAt: nowIso(),
    headline: "Plano semanal personalizado gerado por comportamento local",
    focusBaseline: baseFocus,
    bestWindow,
    days
  };
}
