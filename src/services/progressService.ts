import { getAll, getCurrentUserId, getFirst } from "@/db/database";
import { toDateKey } from "@/utils/date";

export async function getTodayDashboard() {
  const userId = await getCurrentUserId();
  const today = toDateKey(new Date());

  const stats = await getFirst<{
    foco_min: number;
    sessoes_concluidas: number;
    tarefas_concluidas: number;
    habitos_concluidos: number;
  }>("SELECT foco_min, sessoes_concluidas, tarefas_concluidas, habitos_concluidos FROM estatisticas_diarias WHERE usuario_id = ? AND data_ref = ? LIMIT 1", [
    userId,
    today
  ]);

  const pendingTasks = await getAll<{ id: string; titulo: string; prioridade: number }>(
    `
    SELECT id, titulo, prioridade
    FROM tarefas
    WHERE usuario_id = ? AND is_archived = 0 AND status <> 'concluida'
    ORDER BY prioridade DESC, date(data_prevista) ASC
    LIMIT 5
    `,
    [userId]
  );

  const habits = await getAll<{ id: string; nome: string }>(
    `
    SELECT id, nome
    FROM habitos
    WHERE usuario_id = ? AND ativo = 1 AND is_archived = 0
    ORDER BY created_at DESC
    LIMIT 5
    `,
    [userId]
  );

  const streak = await getFirst<{ atual: number }>(
    "SELECT atual FROM streaks WHERE usuario_id = ? AND tipo = 'foco' LIMIT 1",
    [userId]
  );

  return {
    focoMinHoje: stats?.foco_min ?? 0,
    sessoesHoje: stats?.sessoes_concluidas ?? 0,
    tarefasConcluidasHoje: stats?.tarefas_concluidas ?? 0,
    habitosConcluidosHoje: stats?.habitos_concluidos ?? 0,
    pendingTasks,
    habits,
    streakAtual: streak?.atual ?? 0
  };
}

export async function getProgressOverview(period: "daily" | "weekly" | "monthly" = "daily") {
  const userId = await getCurrentUserId();
  if (period === "weekly") {
    return getAll<{ label: string; foco_min: number; sessoes_concluidas: number; tarefas_concluidas: number; habitos_concluidos: number }>(
      `
      SELECT ano_semana as label, foco_min, sessoes_concluidas, tarefas_concluidas, habitos_concluidos
      FROM estatisticas_semanais
      WHERE usuario_id = ?
      ORDER BY ano_semana DESC
      LIMIT 8
      `,
      [userId]
    );
  }
  if (period === "monthly") {
    return getAll<{ label: string; foco_min: number; sessoes_concluidas: number; tarefas_concluidas: number; habitos_concluidos: number }>(
      `
      SELECT ano_mes as label, foco_min, sessoes_concluidas, tarefas_concluidas, habitos_concluidos
      FROM estatisticas_mensais
      WHERE usuario_id = ?
      ORDER BY ano_mes DESC
      LIMIT 8
      `,
      [userId]
    );
  }

  return getAll<{ label: string; foco_min: number; sessoes_concluidas: number; tarefas_concluidas: number; habitos_concluidos: number }>(
    `
    SELECT data_ref as label, foco_min, sessoes_concluidas, tarefas_concluidas, habitos_concluidos
    FROM estatisticas_diarias
    WHERE usuario_id = ?
    ORDER BY data_ref DESC
    LIMIT 14
    `,
    [userId]
  );
}

export async function getBehaviorInsights() {
  const userId = await getCurrentUserId();

  const topDistractions = await getAll<{ motivo: string; total: number }>(
    `
    SELECT COALESCE(md.nome, 'Sem motivo') as motivo, COUNT(*) as total
    FROM sessoes_foco sf
    LEFT JOIN motivos_distracao md ON md.id = sf.motivo_distracao_id
    WHERE sf.usuario_id = ? AND sf.houve_distracao = 1
    GROUP BY COALESCE(md.nome, 'Sem motivo')
    ORDER BY total DESC
    LIMIT 5
    `,
    [userId]
  );

  const byHour = await getAll<{ hora: string; total: number; media_foco: number }>(
    `
    SELECT 
      strftime('%H', started_at) as hora,
      COUNT(*) as total,
      AVG(foco_nivel) as media_foco
    FROM sessoes_foco
    WHERE usuario_id = ?
    GROUP BY strftime('%H', started_at)
    ORDER BY hora ASC
    `,
    [userId]
  );

  const moodVsProductivity = await getAll<{ humor: number; media_foco: number; total: number }>(
    `
    SELECT he.humor as humor, AVG(sf.foco_nivel) as media_foco, COUNT(*) as total
    FROM humor_energia he
    LEFT JOIN sessoes_foco sf
      ON sf.usuario_id = he.usuario_id
      AND date(sf.started_at) = date(he.data_ref)
    WHERE he.usuario_id = ?
    GROUP BY he.humor
    ORDER BY he.humor ASC
    `,
    [userId]
  );

  return {
    topDistractions,
    byHour,
    moodVsProductivity
  };
}

export async function getFocusAnalytics() {
  const userId = await getCurrentUserId();

  const totals = await getFirst<{ total_sessoes: number; total_min: number; media_min: number; interrompidas: number }>(
    `
    SELECT 
      COUNT(*) as total_sessoes,
      SUM(duracao_real_segundos) / 60 as total_min,
      AVG(duracao_real_segundos) / 60 as media_min,
      SUM(CASE WHEN status = 'interrompida' THEN 1 ELSE 0 END) as interrompidas
    FROM sessoes_foco
    WHERE usuario_id = ?
    `,
    [userId]
  );

  const byMode = await getAll<{ modo: string; total: number; minutos: number }>(
    `
    SELECT modo, COUNT(*) as total, SUM(duracao_real_segundos) / 60 as minutos
    FROM sessoes_foco
    WHERE usuario_id = ?
    GROUP BY modo
    ORDER BY total DESC
    `,
    [userId]
  );

  const byTaskCategory = await getAll<{ categoria: string; minutos: number }>(
    `
    SELECT COALESCE(c.nome, 'Sem categoria') as categoria, SUM(sf.duracao_real_segundos) / 60 as minutos
    FROM sessoes_foco sf
    LEFT JOIN tarefas t ON t.id = sf.tarefa_id
    LEFT JOIN categorias c ON c.id = t.categoria_id
    WHERE sf.usuario_id = ?
    GROUP BY COALESCE(c.nome, 'Sem categoria')
    ORDER BY minutos DESC
    `,
    [userId]
  );

  return {
    totals,
    byMode,
    byTaskCategory
  };
}

export async function getTaskAnalytics() {
  const userId = await getCurrentUserId();
  return getFirst<{ criadas: number; concluidas: number; atrasadas: number; taxa_conclusao: number }>(
    `
    SELECT
      COUNT(*) as criadas,
      SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as concluidas,
      SUM(CASE WHEN status <> 'concluida' AND date(data_prevista) < date('now') THEN 1 ELSE 0 END) as atrasadas,
      CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND((SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) END as taxa_conclusao
    FROM tarefas
    WHERE usuario_id = ? AND is_archived = 0
    `,
    [userId]
  );
}

export async function getHabitAnalytics() {
  const userId = await getCurrentUserId();
  return getFirst<{ total_registros: number; concluidos: number; taxa_consistencia: number }>(
    `
    SELECT
      COUNT(r.id) as total_registros,
      SUM(CASE WHEN r.status = 'concluido' THEN 1 ELSE 0 END) as concluidos,
      CASE WHEN COUNT(r.id) = 0 THEN 0 ELSE ROUND((SUM(CASE WHEN r.status = 'concluido' THEN 1 ELSE 0 END) * 100.0) / COUNT(r.id), 2) END as taxa_consistencia
    FROM habitos h
    LEFT JOIN registros_habito r ON r.habito_id = h.id
    WHERE h.usuario_id = ? AND h.is_archived = 0
    `,
    [userId]
  );
}
