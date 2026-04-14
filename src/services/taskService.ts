import { archiveById, deleteById, getAll, getCurrentUserId, getFirst, insert, run, updateById } from "@/db/database";
import { Task } from "@/models/types";
import { logAction } from "@/services/historyService";
import { nowIso, toDateKey } from "@/utils/date";
import { uid } from "@/utils/id";

export interface TaskInput {
  titulo: string;
  descricao?: string;
  categoria_id?: string | null;
  prioridade?: number;
  data_prevista?: string | null;
  hora_prevista?: string | null;
  duracao_estimada_min?: number | null;
  meta_id?: string | null;
  area_id?: string | null;
  repetir_regra?: string | null;
  observacoes?: string | null;
  subtarefas?: string[];
  tags?: string[];
}

export interface TaskFilter {
  periodo?: "hoje" | "futuras" | "atrasadas" | "todas";
  status?: string;
  prioridade?: number;
  categoriaId?: string;
  tag?: string;
  query?: string;
  includeArchived?: boolean;
}

export async function listTasks(filter: TaskFilter = {}) {
  const where: string[] = [filter.includeArchived ? "1=1" : "t.is_archived = 0"];
  const params: unknown[] = [];

  if (filter.periodo === "hoje") {
    where.push("date(t.data_prevista) = date(?)");
    params.push(toDateKey(new Date()));
  }
  if (filter.periodo === "futuras") {
    where.push("date(t.data_prevista) > date(?)");
    params.push(toDateKey(new Date()));
  }
  if (filter.periodo === "atrasadas") {
    where.push("date(t.data_prevista) < date(?) AND t.status <> 'concluida'");
    params.push(toDateKey(new Date()));
  }
  if (filter.status) {
    where.push("t.status = ?");
    params.push(filter.status);
  }
  if (filter.prioridade) {
    where.push("t.prioridade = ?");
    params.push(filter.prioridade);
  }
  if (filter.categoriaId) {
    where.push("t.categoria_id = ?");
    params.push(filter.categoriaId);
  }
  if (filter.tag?.trim()) {
    where.push(
      `
      EXISTS (
        SELECT 1 FROM tarefa_tags tt
        INNER JOIN tags tg ON tg.id = tt.tag_id
        WHERE tt.tarefa_id = t.id AND lower(tg.nome) = lower(?)
      )
      `
    );
    params.push(filter.tag.trim());
  }
  if (filter.query?.trim()) {
    where.push("(t.titulo LIKE ? OR COALESCE(t.descricao, '') LIKE ?)");
    const like = `%${filter.query.trim()}%`;
    params.push(like, like);
  }

  const baseSql = `
    SELECT t.*, c.nome as categoria_nome
    FROM tarefas t
    LEFT JOIN categorias c ON c.id = t.categoria_id
    WHERE ${where.join(" AND ")}
    ORDER BY 
      CASE t.status WHEN 'pendente' THEN 0 WHEN 'em_andamento' THEN 1 WHEN 'concluida' THEN 2 ELSE 3 END,
      date(t.data_prevista) ASC,
      t.prioridade DESC,
      t.created_at DESC
  `;

  return getAll<(Task & { categoria_nome?: string })>(baseSql, params);
}

export async function getTaskById(taskId: string) {
  return getFirst<Task>("SELECT * FROM tarefas WHERE id = ?", [taskId]);
}

export async function listTaskSubtasks(taskId: string) {
  return getAll<{ id: string; titulo: string; concluida: number }>(
    "SELECT id, titulo, concluida FROM subtarefas WHERE tarefa_id = ? ORDER BY ordem ASC, created_at ASC",
    [taskId]
  );
}

export async function listTaskTags(taskId: string) {
  return getAll<{ id: string; nome: string }>(
    `
    SELECT tg.id, tg.nome
    FROM tarefa_tags tt
    INNER JOIN tags tg ON tg.id = tt.tag_id
    WHERE tt.tarefa_id = ?
    ORDER BY tg.nome ASC
    `,
    [taskId]
  );
}

export async function createTask(input: TaskInput) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const id = uid("tsk");

  await insert("tarefas", {
    id,
    usuario_id: userId,
    titulo: input.titulo,
    descricao: input.descricao ?? null,
    categoria_id: input.categoria_id ?? null,
    prioridade: input.prioridade ?? 2,
    data_prevista: input.data_prevista ?? null,
    hora_prevista: input.hora_prevista ?? null,
    duracao_estimada_min: input.duracao_estimada_min ?? null,
    meta_id: input.meta_id ?? null,
    area_id: input.area_id ?? null,
    repetir_regra: input.repetir_regra ?? null,
    observacoes: input.observacoes ?? null,
    status: "pendente",
    is_archived: 0,
    created_at: now,
    updated_at: now
  });

  await replaceSubtasks(id, input.subtarefas ?? []);
  await replaceTaskTags(id, input.tags ?? []);
  await logAction("tarefas", id, "criar", input);

  return id;
}

export async function updateTask(taskId: string, input: TaskInput) {
  const now = nowIso();
  await updateById("tarefas", taskId, {
    titulo: input.titulo,
    descricao: input.descricao ?? null,
    categoria_id: input.categoria_id ?? null,
    prioridade: input.prioridade ?? 2,
    data_prevista: input.data_prevista ?? null,
    hora_prevista: input.hora_prevista ?? null,
    duracao_estimada_min: input.duracao_estimada_min ?? null,
    meta_id: input.meta_id ?? null,
    area_id: input.area_id ?? null,
    repetir_regra: input.repetir_regra ?? null,
    observacoes: input.observacoes ?? null,
    updated_at: now
  });

  await replaceSubtasks(taskId, input.subtarefas ?? []);
  await replaceTaskTags(taskId, input.tags ?? []);
  await logAction("tarefas", taskId, "editar", input);
}

export async function duplicateTask(taskId: string) {
  const task = await getTaskById(taskId);
  if (!task) {
    return "";
  }
  const subtasks = await listTaskSubtasks(taskId);
  const tags = await listTaskTags(taskId);

  return createTask({
    titulo: `${task.titulo} (cópia)`,
    descricao: task.descricao,
    categoria_id: task.categoria_id,
    prioridade: task.prioridade,
    data_prevista: task.data_prevista,
    hora_prevista: task.hora_prevista,
    duracao_estimada_min: task.duracao_estimada_min,
    meta_id: task.meta_id,
    area_id: task.area_id,
    repetir_regra: task.repetir_regra,
    observacoes: task.observacoes,
    subtarefas: subtasks.map((item) => item.titulo),
    tags: tags.map((tag) => tag.nome)
  });
}

export async function setTaskStatus(taskId: string, status: Task["status"]) {
  const now = nowIso();
  await updateById("tarefas", taskId, {
    status,
    concluida_em: status === "concluida" ? now : null,
    updated_at: now
  });
  await logAction("tarefas", taskId, "status", { status });
}

export async function archiveTask(taskId: string) {
  await archiveById("tarefas", taskId);
  await logAction("tarefas", taskId, "arquivar");
}

export async function unarchiveTask(taskId: string) {
  await updateById("tarefas", taskId, {
    is_archived: 0,
    archived_at: null,
    updated_at: nowIso()
  });
  await logAction("tarefas", taskId, "reativar");
}

export async function removeTask(taskId: string) {
  await deleteById("tarefas", taskId);
  await run("DELETE FROM subtarefas WHERE tarefa_id = ?", [taskId]);
  await run("DELETE FROM tarefa_tags WHERE tarefa_id = ?", [taskId]);
  await logAction("tarefas", taskId, "excluir");
}

export async function listOverdueTasks(limit = 10) {
  const userId = await getCurrentUserId();
  return getAll<Task>(
    `
    SELECT *
    FROM tarefas
    WHERE usuario_id = ?
      AND is_archived = 0
      AND status <> 'concluida'
      AND data_prevista IS NOT NULL
      AND date(data_prevista) < date(?)
    ORDER BY prioridade DESC, date(data_prevista) ASC
    LIMIT ?
    `,
    [userId, toDateKey(new Date()), limit]
  );
}

export async function replanOverdueTasks(daysAhead = 1, limit = 3) {
  const now = nowIso();
  const targetDate = toDateKey(new Date(Date.now() + Math.max(daysAhead, 1) * 86400000));
  const overdue = await listOverdueTasks(limit);

  for (const task of overdue) {
    await updateById("tarefas", task.id, {
      data_prevista: targetDate,
      status: task.status === "concluida" ? "concluida" : "pendente",
      updated_at: now
    });
    await logAction("tarefas", task.id, "replanejar", {
      from: task.data_prevista,
      to: targetDate
    });
  }

  return {
    moved: overdue.length,
    targetDate,
    tasks: overdue
  };
}

export async function listCriticalTasks(limit = 5) {
  const userId = await getCurrentUserId();
  return getAll<Task & { criticidade: number }>(
    `
    SELECT
      t.*,
      (
        (CASE WHEN date(t.data_prevista) < date(?) THEN 4 ELSE 0 END) +
        (CASE WHEN date(t.data_prevista) = date(?) THEN 2 ELSE 0 END) +
        (CASE WHEN t.prioridade >= 4 THEN 2 WHEN t.prioridade = 3 THEN 1 ELSE 0 END)
      ) as criticidade
    FROM tarefas t
    WHERE t.usuario_id = ?
      AND t.is_archived = 0
      AND t.status <> 'concluida'
    ORDER BY criticidade DESC, t.prioridade DESC, date(t.data_prevista) ASC
    LIMIT ?
    `,
    [toDateKey(new Date()), toDateKey(new Date()), userId, limit]
  );
}

export async function getPlanningAssistant() {
  const userId = await getCurrentUserId();
  const [criticalTasks, overdue, bestHour, energyVsOutput] = await Promise.all([
    listCriticalTasks(3),
    getFirst<{ total: number }>(
      `
      SELECT COUNT(*) as total
      FROM tarefas
      WHERE usuario_id = ?
        AND is_archived = 0
        AND status <> 'concluida'
        AND data_prevista IS NOT NULL
        AND date(data_prevista) < date(?)
      `,
      [userId, toDateKey(new Date())]
    ),
    getFirst<{ hora: string; media_foco: number; total: number }>(
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
    ),
    getAll<{ energia: number; tarefas_medias: number }>(
      `
      SELECT
        he.energia as energia,
        AVG(COALESCE(ed.tarefas_concluidas, 0)) as tarefas_medias
      FROM humor_energia he
      LEFT JOIN estatisticas_diarias ed
        ON ed.usuario_id = he.usuario_id
        AND date(ed.data_ref) = date(he.data_ref)
      WHERE he.usuario_id = ?
      GROUP BY he.energia
      ORDER BY he.energia ASC
      `,
      [userId]
    )
  ]);

  const lowEnergyAvg =
    energyVsOutput.filter((row) => row.energia <= 2).reduce((sum, row) => sum + (row.tarefas_medias ?? 0), 0) /
    Math.max(energyVsOutput.filter((row) => row.energia <= 2).length, 1);
  const highEnergyAvg =
    energyVsOutput.filter((row) => row.energia >= 4).reduce((sum, row) => sum + (row.tarefas_medias ?? 0), 0) /
    Math.max(energyVsOutput.filter((row) => row.energia >= 4).length, 1);

  let energyGuidance = "Mantenha tarefas curtas quando a energia estiver baixa e reserve blocos longos para picos de energia.";
  if (highEnergyAvg - lowEnergyAvg >= 1) {
    energyGuidance = "Seu rendimento aumenta com energia alta. Agende tarefas longas para seus melhores horarios.";
  }

  const suggestedWindow = bestHour?.hora ? `${bestHour.hora}:00 - ${bestHour.hora}:59` : "Ainda sem janela ideal detectada";

  return {
    criticalTasks,
    overdueCount: overdue?.total ?? 0,
    suggestedWindow,
    energyGuidance
  };
}

async function replaceSubtasks(taskId: string, subtasks: string[]) {
  await run("DELETE FROM subtarefas WHERE tarefa_id = ?", [taskId]);
  const now = nowIso();
  for (const [index, subtask] of subtasks.entries()) {
    if (!subtask.trim()) {
      continue;
    }
    await insert("subtarefas", {
      id: uid("sub"),
      tarefa_id: taskId,
      titulo: subtask.trim(),
      concluida: 0,
      ordem: index,
      created_at: now,
      updated_at: now
    });
  }
}

async function replaceTaskTags(taskId: string, tags: string[]) {
  await run("DELETE FROM tarefa_tags WHERE tarefa_id = ?", [taskId]);
  const now = nowIso();

  for (const rawTag of tags) {
    const normalized = rawTag.trim();
    if (!normalized) {
      continue;
    }

    const found = await getFirst<{ id: string }>("SELECT id FROM tags WHERE lower(nome) = lower(?) LIMIT 1", [normalized]);
    const tagId = found?.id ?? uid("tag");

    if (!found?.id) {
      await insert("tags", {
        id: tagId,
        nome: normalized,
        created_at: now,
        updated_at: now
      });
    }

    await insert("tarefa_tags", {
      id: uid("ttg"),
      tarefa_id: taskId,
      tag_id: tagId,
      created_at: now,
      updated_at: now
    });
  }
}
