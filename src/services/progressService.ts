import { getAll, getCurrentUserId, getFirst } from "@/db/database";
import { toDateKey } from "@/utils/date";

export async function getTodayDashboard() {
  const userId = await getCurrentUserId();
  const today = toDateKey(new Date());

  const stats = await getFirst<{
    foco_min: number;
    sessoes_concluidas: number;
    sessoes_interrompidas: number;
    tarefas_concluidas: number;
    habitos_concluidos: number;
  }>("SELECT foco_min, sessoes_concluidas, sessoes_interrompidas, tarefas_concluidas, habitos_concluidos FROM estatisticas_diarias WHERE usuario_id = ? AND data_ref = ? LIMIT 1", [
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

  const overdueTasks = await getFirst<{ total: number }>(
    `
    SELECT COUNT(*) as total
    FROM tarefas
    WHERE usuario_id = ? AND is_archived = 0 AND status <> 'concluida' AND date(data_prevista) < date(?)
    `,
    [userId, today]
  );

  const bestFocusHour = await getFirst<{ hora: string; media_foco: number; total: number }>(
    `
    SELECT
      strftime('%H', started_at) as hora,
      AVG(COALESCE(foco_nivel, 3)) as media_foco,
      COUNT(*) as total
    FROM sessoes_foco
    WHERE usuario_id = ? AND status = 'concluida'
    GROUP BY strftime('%H', started_at)
    HAVING COUNT(*) >= 2
    ORDER BY media_foco DESC, total DESC
    LIMIT 1
    `,
    [userId]
  );

  const interruptionsToday = stats?.sessoes_interrompidas ?? 0;
  const topPriorities = pendingTasks.slice(0, 3);

  let coachHint = "Mantenha o ritmo: escolha uma tarefa e conclua o proximo bloco de foco.";
  if (interruptionsToday >= 3) {
    coachHint = "Hoje houve muitas interrupcoes. Tente blocos curtos de 15 minutos.";
  } else if ((overdueTasks?.total ?? 0) > 0) {
    coachHint = "Voce tem tarefas atrasadas. Replaneje 1 tarefa para hoje e avance nela.";
  } else if (bestFocusHour?.hora) {
    coachHint = `Seu melhor foco costuma ser por volta de ${bestFocusHour.hora}:00.`;
  }

  return {
    focoMinHoje: stats?.foco_min ?? 0,
    sessoesHoje: stats?.sessoes_concluidas ?? 0,
    tarefasConcluidasHoje: stats?.tarefas_concluidas ?? 0,
    habitosConcluidosHoje: stats?.habitos_concluidos ?? 0,
    pendingTasks,
    topPriorities,
    overdueTasks: overdueTasks?.total ?? 0,
    habits,
    streakAtual: streak?.atual ?? 0,
    coachHint,
    bestFocusHour: bestFocusHour?.hora ?? null
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

export async function getAdaptiveDailyFocusGoal() {
  const userId = await getCurrentUserId();
  const recent = await getAll<{ foco_min: number }>(
    `
    SELECT foco_min
    FROM estatisticas_diarias
    WHERE usuario_id = ?
      AND foco_min > 0
    ORDER BY data_ref DESC
    LIMIT 7
    `,
    [userId]
  );

  if (recent.length === 0) {
    return {
      suggestedMinutes: 60,
      baselineMinutes: 60,
      confidence: "baixa" as const
    };
  }

  const avg = Math.round(recent.reduce((sum, item) => sum + (item.foco_min || 0), 0) / recent.length);
  const suggested = Math.min(180, Math.max(25, Math.round(avg * 1.1)));

  return {
    suggestedMinutes: suggested,
    baselineMinutes: avg,
    confidence: recent.length >= 5 ? "alta" as const : "media" as const
  };
}

export async function getConsistencyAlerts() {
  const userId = await getCurrentUserId();
  const streak = await getFirst<{ atual: number; recorde: number; ultimo_registro_data?: string }>(
    `
    SELECT atual, recorde, ultimo_registro_data
    FROM streaks
    WHERE usuario_id = ? AND tipo = 'foco'
    LIMIT 1
    `,
    [userId]
  );

  const recent = await getAll<{ data_ref: string; foco_min: number; tarefas_concluidas: number }>(
    `
    SELECT data_ref, foco_min, tarefas_concluidas
    FROM estatisticas_diarias
    WHERE usuario_id = ?
    ORDER BY data_ref DESC
    LIMIT 5
    `,
    [userId]
  );

  const alerts: string[] = [];
  if ((streak?.atual ?? 0) === 0 && (streak?.recorde ?? 0) >= 3) {
    alerts.push("Sua sequencia foi interrompida. Retome com um bloco curto hoje.");
  }

  const noFocusDays = recent.filter((row) => (row.foco_min ?? 0) === 0).length;
  if (noFocusDays >= 2) {
    alerts.push("Voce ficou 2+ dias sem foco registrado recentemente.");
  }

  const lowTaskOutput = recent.filter((row) => (row.tarefas_concluidas ?? 0) === 0).length;
  if (lowTaskOutput >= 3) {
    alerts.push("A conclusao de tarefas caiu. Replaneje apenas 3 prioridades para hoje.");
  }

  return alerts;
}

export async function getWeeklyNarrativeReport() {
  const userId = await getCurrentUserId();
  const weeks = await getAll<{
    ano_semana: string;
    foco_min: number;
    sessoes_concluidas: number;
    tarefas_concluidas: number;
    habitos_concluidos: number;
    taxa_consistencia: number;
  }>(
    `
    SELECT ano_semana, foco_min, sessoes_concluidas, tarefas_concluidas, habitos_concluidos, taxa_consistencia
    FROM estatisticas_semanais
    WHERE usuario_id = ?
    ORDER BY ano_semana DESC
    LIMIT 2
    `,
    [userId]
  );

  const current = weeks[0];
  const previous = weeks[1];

  if (!current) {
    return {
      summary: "Ainda nao ha dados semanais suficientes para gerar relatorio.",
      highlights: [] as string[]
    };
  }

  const deltaFocus = (current.foco_min ?? 0) - (previous?.foco_min ?? 0);
  const deltaTasks = (current.tarefas_concluidas ?? 0) - (previous?.tarefas_concluidas ?? 0);
  const highlights: string[] = [
    `Foco semanal: ${current.foco_min ?? 0} min (${deltaFocus >= 0 ? "+" : ""}${deltaFocus} vs semana anterior).`,
    `Tarefas concluidas: ${current.tarefas_concluidas ?? 0} (${deltaTasks >= 0 ? "+" : ""}${deltaTasks} vs semana anterior).`,
    `Habitos concluidos: ${current.habitos_concluidos ?? 0}.`
  ];

  let summary = "Semana estavel.";
  if (deltaFocus > 30 && deltaTasks >= 0) {
    summary = "Semana forte: voce aumentou foco sem perder entrega.";
  } else if (deltaFocus < -30) {
    summary = "Queda de foco detectada: reduza meta diaria para retomar consistencia.";
  }

  return { summary, highlights };
}

export async function getComparativeTrends() {
  const userId = await getCurrentUserId();
  const months = await getAll<{
    ano_mes: string;
    foco_min: number;
    sessoes_concluidas: number;
    tarefas_concluidas: number;
    habitos_concluidos: number;
  }>(
    `
    SELECT ano_mes, foco_min, sessoes_concluidas, tarefas_concluidas, habitos_concluidos
    FROM estatisticas_mensais
    WHERE usuario_id = ?
    ORDER BY ano_mes DESC
    LIMIT 2
    `,
    [userId]
  );

  const current = months[0];
  const previous = months[1];
  if (!current) {
    return null;
  }

  return {
    current,
    previous,
    deltaFocus: (current.foco_min ?? 0) - (previous?.foco_min ?? 0),
    deltaTasks: (current.tarefas_concluidas ?? 0) - (previous?.tarefas_concluidas ?? 0),
    deltaHabits: (current.habitos_concluidos ?? 0) - (previous?.habitos_concluidos ?? 0)
  };
}

export async function getEnergyProductivityCorrelation() {
  const userId = await getCurrentUserId();
  const rows = await getAll<{ energia: number; tarefas: number; foco: number }>(
    `
    SELECT
      he.energia as energia,
      AVG(COALESCE(ed.tarefas_concluidas, 0)) as tarefas,
      AVG(COALESCE(ed.foco_min, 0)) as foco
    FROM humor_energia he
    LEFT JOIN estatisticas_diarias ed
      ON ed.usuario_id = he.usuario_id
      AND date(ed.data_ref) = date(he.data_ref)
    WHERE he.usuario_id = ?
    GROUP BY he.energia
    ORDER BY he.energia ASC
    `,
    [userId]
  );

  return rows.map((row) => ({
    energia: row.energia,
    tarefasMedias: Number((row.tarefas ?? 0).toFixed(2)),
    focoMedio: Number((row.foco ?? 0).toFixed(2))
  }));
}

export async function getLongTermMonthlyTrend(months = 6) {
  const userId = await getCurrentUserId();
  const rows = await getAll<{
    ano_mes: string;
    foco_min: number;
    sessoes_concluidas: number;
    tarefas_concluidas: number;
    habitos_concluidos: number;
    taxa_consistencia: number;
  }>(
    `
    SELECT ano_mes, foco_min, sessoes_concluidas, tarefas_concluidas, habitos_concluidos, taxa_consistencia
    FROM estatisticas_mensais
    WHERE usuario_id = ?
    ORDER BY ano_mes DESC
    LIMIT ?
    `,
    [userId, Math.max(2, months)]
  );

  if (rows.length === 0) {
    return {
      rows,
      trendDirection: "estavel" as const,
      consistencyScore: 0,
      summary: "Sem dados mensais suficientes."
    };
  }

  const ordered = rows.slice().reverse();
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const deltaFocus = (last?.foco_min ?? 0) - (first?.foco_min ?? 0);

  let trendDirection: "alta" | "queda" | "estavel" = "estavel";
  if (deltaFocus >= 30) {
    trendDirection = "alta";
  } else if (deltaFocus <= -30) {
    trendDirection = "queda";
  }

  const avgConsistency =
    ordered.reduce((sum, row) => sum + (row.taxa_consistencia ?? 0), 0) / Math.max(ordered.length, 1);
  const consistencyScore = Number(avgConsistency.toFixed(1));

  let summary = "Seu desempenho de longo prazo esta estavel.";
  if (trendDirection === "alta") {
    summary = "Sua tendencia de foco esta em crescimento consistente.";
  } else if (trendDirection === "queda") {
    summary = "Queda detectada no foco de longo prazo. Ajuste a meta para recuperar ritmo.";
  }

  return {
    rows,
    trendDirection,
    consistencyScore,
    summary
  };
}
