import { archiveById, deleteById, getAll, getCurrentUserId, getFirst, insert, updateById } from "@/db/database";
import { Goal } from "@/models/types";
import { logAction } from "@/services/historyService";
import { nowIso } from "@/utils/date";
import { uid } from "@/utils/id";

export interface GoalInput {
  titulo: string;
  descricao?: string;
  prazo?: string | null;
  area_id?: string | null;
  progresso_percentual?: number;
}

export async function listGoals(includeArchived = false) {
  return getAll<Goal>(
    `
    SELECT * FROM metas
    WHERE ${includeArchived ? "1=1" : "is_archived = 0"}
    ORDER BY status = 'concluida' ASC, prazo ASC, created_at DESC
    `
  );
}

export async function getGoalById(id: string) {
  return getFirst<Goal>("SELECT * FROM metas WHERE id = ?", [id]);
}

export async function createGoal(input: GoalInput) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const id = uid("gol");

  await insert("metas", {
    id,
    usuario_id: userId,
    area_id: input.area_id ?? null,
    titulo: input.titulo,
    descricao: input.descricao ?? null,
    prazo: input.prazo ?? null,
    progresso_percentual: input.progresso_percentual ?? 0,
    status: "ativa",
    is_archived: 0,
    created_at: now,
    updated_at: now
  });

  await logAction("metas", id, "criar", input);
  return id;
}

export async function updateGoal(goalId: string, input: GoalInput) {
  await updateById("metas", goalId, {
    area_id: input.area_id ?? null,
    titulo: input.titulo,
    descricao: input.descricao ?? null,
    prazo: input.prazo ?? null,
    progresso_percentual: input.progresso_percentual ?? 0,
    updated_at: nowIso()
  });
  await logAction("metas", goalId, "editar", input);
}

export async function setGoalStatus(goalId: string, status: "ativa" | "concluida" | "arquivada") {
  const payload: Record<string, unknown> = {
    status,
    updated_at: nowIso()
  };
  if (status === "concluida") {
    payload.progresso_percentual = 100;
  }
  await updateById("metas", goalId, {
    ...payload
  });
  await logAction("metas", goalId, "status", { status });
}

export async function archiveGoal(goalId: string) {
  await archiveById("metas", goalId);
  await setGoalStatus(goalId, "arquivada");
}

export async function unarchiveGoal(goalId: string) {
  await updateById("metas", goalId, {
    is_archived: 0,
    archived_at: null,
    status: "ativa",
    updated_at: nowIso()
  });
  await logAction("metas", goalId, "reativar");
}

export async function removeGoal(goalId: string) {
  await deleteById("metas", goalId);
  await logAction("metas", goalId, "excluir");
}

export async function updateGoalProgressFromTasks(goalId: string) {
  const row = await getFirst<{ total: number; done: number }>(
    `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as done
    FROM tarefas
    WHERE meta_id = ? AND is_archived = 0
    `,
    [goalId]
  );
  const total = row?.total ?? 0;
  const done = row?.done ?? 0;
  const percentual = total === 0 ? 0 : Math.round((done / total) * 100);
  await updateById("metas", goalId, {
    progresso_percentual: percentual,
    updated_at: nowIso()
  });
  return percentual;
}
