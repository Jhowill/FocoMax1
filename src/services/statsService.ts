import { getCurrentUserId, getFirst, insert, run, updateById } from "@/db/database";
import { nowIso, toDateKey } from "@/utils/date";
import { uid } from "@/utils/id";

function getWeekKey(date = new Date()) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - firstJan.getTime()) / 86400000);
  const week = Math.ceil((days + firstJan.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${`${week}`.padStart(2, "0")}`;
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

async function upsertDailyBase() {
  const userId = await getCurrentUserId();
  const dataRef = toDateKey(new Date());
  const now = nowIso();

  const existing = await getFirst<{ id: string }>(
    "SELECT id FROM estatisticas_diarias WHERE usuario_id = ? AND data_ref = ? LIMIT 1",
    [userId, dataRef]
  );

  if (existing?.id) {
    return existing.id;
  }

  const id = uid("std");
  await insert("estatisticas_diarias", {
    id,
    usuario_id: userId,
    data_ref: dataRef,
    foco_min: 0,
    sessoes_concluidas: 0,
    sessoes_interrompidas: 0,
    tarefas_concluidas: 0,
    habitos_concluidos: 0,
    xp_ganho: 0,
    created_at: now,
    updated_at: now
  });
  return id;
}

async function upsertWeeklyBase() {
  const userId = await getCurrentUserId();
  const key = getWeekKey(new Date());
  const now = nowIso();

  const existing = await getFirst<{ id: string }>(
    "SELECT id FROM estatisticas_semanais WHERE usuario_id = ? AND ano_semana = ? LIMIT 1",
    [userId, key]
  );
  if (existing?.id) {
    return existing.id;
  }

  const id = uid("stw");
  await insert("estatisticas_semanais", {
    id,
    usuario_id: userId,
    ano_semana: key,
    foco_min: 0,
    sessoes_concluidas: 0,
    tarefas_concluidas: 0,
    habitos_concluidos: 0,
    taxa_consistencia: 0,
    created_at: now,
    updated_at: now
  });
  return id;
}

async function upsertMonthlyBase() {
  const userId = await getCurrentUserId();
  const key = getMonthKey(new Date());
  const now = nowIso();

  const existing = await getFirst<{ id: string }>(
    "SELECT id FROM estatisticas_mensais WHERE usuario_id = ? AND ano_mes = ? LIMIT 1",
    [userId, key]
  );
  if (existing?.id) {
    return existing.id;
  }

  const id = uid("stm");
  await insert("estatisticas_mensais", {
    id,
    usuario_id: userId,
    ano_mes: key,
    foco_min: 0,
    sessoes_concluidas: 0,
    tarefas_concluidas: 0,
    habitos_concluidos: 0,
    taxa_consistencia: 0,
    created_at: now,
    updated_at: now
  });
  return id;
}

export async function addFocusMinutes(minutes: number, interrupted = false) {
  const now = nowIso();
  const userId = await getCurrentUserId();
  const dailyId = await upsertDailyBase();
  const weeklyId = await upsertWeeklyBase();
  const monthlyId = await upsertMonthlyBase();

  if (interrupted) {
    await run(
      "UPDATE estatisticas_diarias SET sessoes_interrompidas = sessoes_interrompidas + 1, updated_at = ? WHERE id = ?",
      [now, dailyId]
    );
    return;
  }

  await run(
    `
    UPDATE estatisticas_diarias
    SET foco_min = foco_min + ?, sessoes_concluidas = sessoes_concluidas + 1, updated_at = ?
    WHERE id = ?
    `,
    [minutes, now, dailyId]
  );

  await run(
    `
    UPDATE estatisticas_semanais
    SET foco_min = foco_min + ?, sessoes_concluidas = sessoes_concluidas + 1, updated_at = ?
    WHERE id = ?
    `,
    [minutes, now, weeklyId]
  );

  await run(
    `
    UPDATE estatisticas_mensais
    SET foco_min = foco_min + ?, sessoes_concluidas = sessoes_concluidas + 1, updated_at = ?
    WHERE id = ?
    `,
    [minutes, now, monthlyId]
  );

  const profile = await getFirst<{ id: string }>("SELECT id FROM perfil_usuario WHERE usuario_id = ? LIMIT 1", [userId]);
  if (profile?.id) {
    await run(
      "UPDATE perfil_usuario SET foco_acumulado_min = foco_acumulado_min + ?, updated_at = ? WHERE id = ?",
      [minutes, now, profile.id]
    );
  }
}

export async function addTaskCompletion() {
  const now = nowIso();
  const userId = await getCurrentUserId();
  const dailyId = await upsertDailyBase();
  const weeklyId = await upsertWeeklyBase();
  const monthlyId = await upsertMonthlyBase();
  await run("UPDATE estatisticas_diarias SET tarefas_concluidas = tarefas_concluidas + 1, updated_at = ? WHERE id = ?", [now, dailyId]);
  await run("UPDATE estatisticas_semanais SET tarefas_concluidas = tarefas_concluidas + 1, updated_at = ? WHERE id = ?", [now, weeklyId]);
  await run("UPDATE estatisticas_mensais SET tarefas_concluidas = tarefas_concluidas + 1, updated_at = ? WHERE id = ?", [now, monthlyId]);
  const profile = await getFirst<{ id: string }>("SELECT id FROM perfil_usuario WHERE usuario_id = ? LIMIT 1", [userId]);
  if (profile?.id) {
    await run("UPDATE perfil_usuario SET tarefas_concluidas = tarefas_concluidas + 1, updated_at = ? WHERE id = ?", [now, profile.id]);
  }
}

export async function addHabitCompletion() {
  const now = nowIso();
  const userId = await getCurrentUserId();
  const dailyId = await upsertDailyBase();
  const weeklyId = await upsertWeeklyBase();
  const monthlyId = await upsertMonthlyBase();
  await run("UPDATE estatisticas_diarias SET habitos_concluidos = habitos_concluidos + 1, updated_at = ? WHERE id = ?", [now, dailyId]);
  await run("UPDATE estatisticas_semanais SET habitos_concluidos = habitos_concluidos + 1, updated_at = ? WHERE id = ?", [now, weeklyId]);
  await run("UPDATE estatisticas_mensais SET habitos_concluidos = habitos_concluidos + 1, updated_at = ? WHERE id = ?", [now, monthlyId]);
  const profile = await getFirst<{ id: string }>("SELECT id FROM perfil_usuario WHERE usuario_id = ? LIMIT 1", [userId]);
  if (profile?.id) {
    await run("UPDATE perfil_usuario SET habitos_mantidos = habitos_mantidos + 1, updated_at = ? WHERE id = ?", [now, profile.id]);
  }
}

export async function addXp(xp: number) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const dailyId = await upsertDailyBase();

  await run("UPDATE estatisticas_diarias SET xp_ganho = xp_ganho + ?, updated_at = ? WHERE id = ?", [xp, now, dailyId]);

  const profile = await getFirst<{ id: string; xp_total: number }>("SELECT id, xp_total FROM perfil_usuario WHERE usuario_id = ? LIMIT 1", [userId]);
  if (!profile?.id) {
    return;
  }

  const xpTotal = (profile.xp_total ?? 0) + xp;
  const level = Math.floor(xpTotal / 100) + 1;
  await updateById("perfil_usuario", profile.id, {
    xp_total: xpTotal,
    nivel: level,
    updated_at: now
  });
}

export async function refreshStreak(type: "foco" | "habito", hasDoneToday: boolean) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));

  const streak = await getFirst<{ id: string; atual: number; recorde: number; ultimo_registro_data?: string }>(
    "SELECT id, atual, recorde, ultimo_registro_data FROM streaks WHERE usuario_id = ? AND tipo = ? LIMIT 1",
    [userId, type]
  );
  if (!streak?.id) {
    return;
  }

  let atual = streak.atual ?? 0;
  if (!hasDoneToday) {
    if (streak.ultimo_registro_data && streak.ultimo_registro_data !== today && streak.ultimo_registro_data !== yesterday) {
      atual = 0;
    }
  } else if (streak.ultimo_registro_data === today) {
    atual = streak.atual ?? 0;
  } else if (streak.ultimo_registro_data === yesterday) {
    atual = (streak.atual ?? 0) + 1;
  } else {
    atual = 1;
  }

  const recorde = Math.max(streak.recorde ?? 0, atual);
  await updateById("streaks", streak.id, {
    atual,
    recorde,
    ultimo_registro_data: hasDoneToday ? today : streak.ultimo_registro_data,
    updated_at: now
  });
}
