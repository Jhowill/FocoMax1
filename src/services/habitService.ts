import { archiveById, deleteById, getAll, getCurrentUserId, getFirst, insert, run, updateById } from "@/db/database";
import { Habit } from "@/models/types";
import { logAction } from "@/services/historyService";
import { nowIso, toDateKey } from "@/utils/date";
import { uid } from "@/utils/id";

export interface HabitInput {
  nome: string;
  descricao?: string;
  frequencia: string;
  melhor_horario?: string;
  meta_semanal?: number;
  tipo?: string;
  dificuldade?: string;
  cor?: string;
  icone?: string;
  categoria_id?: string | null;
  lembrete_local?: boolean;
}

export async function listHabits(includeArchived = false) {
  return getAll<Habit>(
    `
    SELECT * FROM habitos
    WHERE ${includeArchived ? "1=1" : "is_archived = 0"}
    ORDER BY ativo DESC, created_at DESC
    `
  );
}

export async function getHabitById(id: string) {
  return getFirst<Habit>("SELECT * FROM habitos WHERE id = ?", [id]);
}

export async function createHabit(input: HabitInput) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const id = uid("hab");

  await insert("habitos", {
    id,
    usuario_id: userId,
    categoria_id: input.categoria_id ?? null,
    nome: input.nome,
    descricao: input.descricao ?? null,
    frequencia: input.frequencia,
    melhor_horario: input.melhor_horario ?? null,
    meta_semanal: input.meta_semanal ?? 3,
    tipo: input.tipo ?? null,
    dificuldade: input.dificuldade ?? null,
    cor: input.cor ?? "#3B82F6",
    icone: input.icone ?? "check",
    lembrete_local: input.lembrete_local ? 1 : 0,
    ativo: 1,
    is_archived: 0,
    created_at: now,
    updated_at: now
  });

  await logAction("habitos", id, "criar", input);
  return id;
}

export async function updateHabit(id: string, input: HabitInput) {
  await updateById("habitos", id, {
    categoria_id: input.categoria_id ?? null,
    nome: input.nome,
    descricao: input.descricao ?? null,
    frequencia: input.frequencia,
    melhor_horario: input.melhor_horario ?? null,
    meta_semanal: input.meta_semanal ?? 3,
    tipo: input.tipo ?? null,
    dificuldade: input.dificuldade ?? null,
    cor: input.cor ?? "#3B82F6",
    icone: input.icone ?? "check",
    lembrete_local: input.lembrete_local ? 1 : 0,
    updated_at: nowIso()
  });
  await logAction("habitos", id, "editar", input);
}

export async function archiveHabit(id: string) {
  await archiveById("habitos", id);
  await logAction("habitos", id, "arquivar");
}

export async function unarchiveHabit(id: string) {
  await updateById("habitos", id, {
    is_archived: 0,
    archived_at: null,
    updated_at: nowIso()
  });
  await logAction("habitos", id, "reativar");
}

export async function removeHabit(id: string) {
  await deleteById("habitos", id);
  await run("DELETE FROM registros_habito WHERE habito_id = ?", [id]);
  await logAction("habitos", id, "excluir");
}

export async function markHabit(habitId: string, status: "concluido" | "falhou" | "ignorado", dateRef?: string) {
  const now = nowIso();
  const ref = dateRef ?? toDateKey(new Date());
  const existing = await getFirst<{ id: string }>(
    "SELECT id FROM registros_habito WHERE habito_id = ? AND data_ref = ? LIMIT 1",
    [habitId, ref]
  );

  if (existing?.id) {
    await updateById("registros_habito", existing.id, { status, updated_at: now });
    await logAction("registros_habito", existing.id, "editar", { habitId, status, ref });
    return existing.id;
  }

  const id = uid("hrc");
  await insert("registros_habito", {
    id,
    habito_id: habitId,
    data_ref: ref,
    status,
    created_at: now,
    updated_at: now
  });
  await logAction("registros_habito", id, "criar", { habitId, status, ref });
  return id;
}

export async function listHabitRecords(habitId: string) {
  return getAll<{ id: string; data_ref: string; status: string }>(
    "SELECT id, data_ref, status FROM registros_habito WHERE habito_id = ? ORDER BY data_ref DESC",
    [habitId]
  );
}

export async function getHabitConsistency(habitId: string) {
  const row = await getFirst<{ total: number; success: number }>(
    `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as success
    FROM registros_habito
    WHERE habito_id = ?
    `,
    [habitId]
  );

  const total = row?.total ?? 0;
  const success = row?.success ?? 0;
  const rate = total > 0 ? Math.round((success / total) * 100) : 0;
  return { total, success, rate };
}
