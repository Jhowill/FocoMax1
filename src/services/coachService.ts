import { getAll, getCurrentUserId, getFirst, insert, run, updateById } from "@/db/database";
import { Suggestion } from "@/models/types";
import { nowIso } from "@/utils/date";
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
  const suggestions: Array<{ tipo: string; texto: string }> = [];

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
