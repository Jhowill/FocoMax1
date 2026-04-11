import { getAll, getCurrentUserId, getFirst, insert, updateById } from "@/db/database";
import { addXp } from "@/services/statsService";
import { nowIso } from "@/utils/date";
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

  const unlocks: Array<{ key: string; name: string; description: string; xpBonus: number }> = [];

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
