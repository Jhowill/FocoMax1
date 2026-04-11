import { getAll, getCurrentUserId, getFirst, insert } from "@/db/database";
import { nowIso } from "@/utils/date";
import { uid } from "@/utils/id";

export async function listCategories(type?: string) {
  if (type) {
    return getAll<{ id: string; nome: string; cor?: string }>(
      "SELECT id, nome, cor FROM categorias WHERE tipo = ? ORDER BY nome ASC",
      [type]
    );
  }
  return getAll<{ id: string; nome: string; cor?: string }>("SELECT id, nome, cor FROM categorias ORDER BY nome ASC");
}

export async function createCategory(nome: string, tipo: string) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const id = uid("cat");
  await insert("categorias", {
    id,
    usuario_id: userId,
    nome,
    tipo,
    created_at: now,
    updated_at: now
  });
  return id;
}

export async function listAreasLife() {
  return getAll<{ id: string; nome: string }>("SELECT id, nome FROM areas_vida WHERE is_archived = 0 ORDER BY nome ASC");
}

export async function createAreaLife(nome: string, descricao?: string) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const id = uid("arv");
  await insert("areas_vida", {
    id,
    usuario_id: userId,
    nome,
    descricao: descricao ?? null,
    is_archived: 0,
    created_at: now,
    updated_at: now
  });
  return id;
}

export async function listObjectives() {
  return getAll<{ id: string; titulo: string }>("SELECT id, titulo FROM objetivos WHERE is_archived = 0 ORDER BY prioridade DESC");
}

export async function ensureQuickObjective(titulo: string) {
  const userId = await getCurrentUserId();
  const found = await getFirst<{ id: string }>("SELECT id FROM objetivos WHERE lower(titulo) = lower(?) LIMIT 1", [titulo]);
  if (found?.id) {
    return found.id;
  }
  const now = nowIso();
  const id = uid("obj");
  await insert("objetivos", {
    id,
    usuario_id: userId,
    titulo,
    prioridade: 2,
    status: "ativo",
    is_archived: 0,
    created_at: now,
    updated_at: now
  });
  return id;
}
