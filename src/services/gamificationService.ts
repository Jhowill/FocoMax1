import { getAll, getCurrentUserId, getFirst, insert, updateById } from "@/db/database";
import { addXp } from "@/services/statsService";
import { nowIso, toDateKey } from "@/utils/date";
import { uid } from "@/utils/id";

export async function getGamificationSummary() {
  const userId = await getCurrentUserId();

  const profile = await getFirst<{
    nivel: number;
    xp_total: number;
    foco_acumulado_min: number;
    tarefas_concluidas: number;
    habitos_mantidos: number;
  }>("SELECT nivel, xp_total, foco_acumulado_min, tarefas_concluidas, habitos_mantidos FROM perfil_usuario WHERE usuario_id = ? LIMIT 1", [
    userId
  ]);

  const streakFoco = await getFirst<{ atual: number; recorde: number }>(
    "SELECT atual, recorde FROM streaks WHERE usuario_id = ? AND tipo = 'foco' LIMIT 1",
    [userId]
  );

  const streakHabito = await getFirst<{ atual: number; recorde: number }>(
    "SELECT atual, recorde FROM streaks WHERE usuario_id = ? AND tipo = 'habito' LIMIT 1",
    [userId]
  );

  const achievements = await getAll<{ id: string; nome: string; descricao: string; desbloqueada_em: string }>(
    "SELECT id, nome, descricao, desbloqueada_em FROM conquistas WHERE usuario_id = ? ORDER BY desbloqueada_em DESC",
    [userId]
  );

  const rewards = await getAll<{ id: string; nome: string; tipo: string; desbloqueada: number; premium: number }>(
    "SELECT id, nome, tipo, desbloqueada, premium FROM recompensas ORDER BY premium ASC, nome ASC"
  );

  return {
    profile,
    streakFoco,
    streakHabito,
    achievements,
    rewards
  };
}

export async function grantXpForTask() {
  await addXp(8);
}

export async function grantXpForHabit() {
  await addXp(6);
}

export async function evaluateAchievements() {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const checks = await Promise.all([
    getFirst<{ total: number }>("SELECT COUNT(*) as total FROM sessoes_foco WHERE usuario_id = ? AND status = 'concluida'", [userId]),
    getFirst<{ total: number }>("SELECT COUNT(*) as total FROM tarefas WHERE usuario_id = ? AND status = 'concluida'", [userId]),
    getFirst<{ atual: number }>("SELECT atual FROM streaks WHERE usuario_id = ? AND tipo = 'foco' LIMIT 1", [userId])
  ]);

  const completedSessions = checks[0]?.total ?? 0;
  const completedTasks = checks[1]?.total ?? 0;
  const focusStreak = checks[2]?.atual ?? 0;

  const unlocks: { key: string; name: string; description: string; xpBonus: number }[] = [];

  if (completedSessions >= 10) {
    unlocks.push({
      key: "primeiro_ritmo",
      name: "Primeiro Ritmo",
      description: "Concluiu 10 sessões de foco.",
      xpBonus: 30
    });
  }
  if (completedTasks >= 20) {
    unlocks.push({
      key: "executor_consistente",
      name: "Executor Consistente",
      description: "Concluiu 20 tarefas.",
      xpBonus: 40
    });
  }
  if (focusStreak >= 7) {
    unlocks.push({
      key: "sequencia_forte",
      name: "Sequência Forte",
      description: "Manteve 7 dias de streak de foco.",
      xpBonus: 60
    });
  }

  for (const unlock of unlocks) {
    const existing = await getFirst<{ id: string }>("SELECT id FROM conquistas WHERE chave = ? LIMIT 1", [unlock.key]);
    if (existing?.id) {
      continue;
    }

    await insert("conquistas", {
      id: uid("ach"),
      usuario_id: userId,
      chave: unlock.key,
      nome: unlock.name,
      descricao: unlock.description,
      desbloqueada_em: now,
      xp_bonus: unlock.xpBonus,
      created_at: now,
      updated_at: now
    });

    await addXp(unlock.xpBonus);
  }

  await unlockRewardsByRules();
}

async function unlockRewardsByRules() {
  const now = nowIso();
  const sessions = await getFirst<{ total: number }>("SELECT COUNT(*) as total FROM sessoes_foco WHERE status = 'concluida'");
  const streak = await getFirst<{ max: number }>("SELECT MAX(recorde) as max FROM streaks WHERE tipo = 'foco'");
  const level = await getFirst<{ nivel: number }>("SELECT nivel FROM perfil_usuario LIMIT 1");

  const rules = [
    { chave: "tema_oceano", canUnlock: (sessions?.total ?? 0) >= 10 },
    { chave: "som_montanha", canUnlock: (streak?.max ?? 0) >= 7 },
    { chave: "moldura_lendaria", canUnlock: (level?.nivel ?? 1) >= 10 }
  ];

  for (const rule of rules) {
    if (!rule.canUnlock) {
      continue;
    }
    const reward = await getFirst<{ id: string; desbloqueada: number }>("SELECT id, desbloqueada FROM recompensas WHERE chave = ? LIMIT 1", [
      rule.chave
    ]);
    if (!reward?.id || reward.desbloqueada) {
      continue;
    }
    await updateById("recompensas", reward.id, {
      desbloqueada: 1,
      desbloqueada_em: now,
      updated_at: now
    });
  }
}

type ChallengeItem = {
  id: string;
  title: string;
  progress: number;
  target: number;
  xp: number;
  period: "diario" | "semanal";
  premium: boolean;
  stage: number;
};

export async function getStructuredChallenges(isPremium: boolean) {
  const userId = await getCurrentUserId();
  const today = toDateKey(new Date());
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = toDateKey(new Date(now.getTime() + mondayOffset * 86400000));

  const [daily, weekly] = await Promise.all([
    getFirst<{ foco_min: number; tarefas_concluidas: number; habitos_concluidos: number }>(
      `
      SELECT foco_min, tarefas_concluidas, habitos_concluidos
      FROM estatisticas_diarias
      WHERE usuario_id = ? AND data_ref = ?
      LIMIT 1
      `,
      [userId, today]
    ),
    getFirst<{ foco_min: number; tarefas_concluidas: number; habitos_concluidos: number; sessoes_concluidas: number }>(
      `
      SELECT
        SUM(COALESCE(foco_min, 0)) as foco_min,
        SUM(COALESCE(tarefas_concluidas, 0)) as tarefas_concluidas,
        SUM(COALESCE(habitos_concluidos, 0)) as habitos_concluidos,
        SUM(COALESCE(sessoes_concluidas, 0)) as sessoes_concluidas
      FROM estatisticas_diarias
      WHERE usuario_id = ? AND date(data_ref) >= date(?)
      `,
      [userId, weekStart]
    )
  ]);

  const dailyChallenges: ChallengeItem[] = [
    {
      id: "daily_focus_blocks",
      title: "Concluir 2 blocos de foco (50 min)",
      progress: Math.min(daily?.foco_min ?? 0, 50),
      target: 50,
      xp: 25,
      period: "diario",
      premium: false,
      stage: 1
    },
    {
      id: "daily_tasks",
      title: "Finalizar 3 tarefas",
      progress: Math.min(daily?.tarefas_concluidas ?? 0, 3),
      target: 3,
      xp: 20,
      period: "diario",
      premium: false,
      stage: 1
    },
    {
      id: "daily_habits",
      title: "Marcar 2 habitos",
      progress: Math.min(daily?.habitos_concluidos ?? 0, 2),
      target: 2,
      xp: 15,
      period: "diario",
      premium: false,
      stage: 1
    }
  ];

  const weeklyChallenges: ChallengeItem[] = [
    {
      id: "weekly_focus",
      title: "Acumular 300 min de foco",
      progress: Math.min(weekly?.foco_min ?? 0, 300),
      target: 300,
      xp: 80,
      period: "semanal",
      premium: false,
      stage: 1
    },
    {
      id: "weekly_tasks",
      title: "Concluir 12 tarefas na semana",
      progress: Math.min(weekly?.tarefas_concluidas ?? 0, 12),
      target: 12,
      xp: 70,
      period: "semanal",
      premium: false,
      stage: 1
    }
  ];

  const premiumTrack: ChallengeItem[] = isPremium
    ? [
        {
          id: "premium_stage_1",
          title: "Trilha Premium Fase 1: 5 sessoes concluidas",
          progress: Math.min(weekly?.sessoes_concluidas ?? 0, 5),
          target: 5,
          xp: 90,
          period: "semanal",
          premium: true,
          stage: 1
        },
        {
          id: "premium_stage_2",
          title: "Trilha Premium Fase 2: 450 min + 15 tarefas",
          progress: Math.min(Math.round((weekly?.foco_min ?? 0) / 30) + (weekly?.tarefas_concluidas ?? 0), 30),
          target: 30,
          xp: 140,
          period: "semanal",
          premium: true,
          stage: 2
        }
      ]
    : [];

  return {
    dailyChallenges,
    weeklyChallenges,
    premiumTrack
  };
}
