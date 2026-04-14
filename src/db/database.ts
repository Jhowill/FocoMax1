import * as SQLite from "expo-sqlite";

import { schemaStatements } from "@/db/schema";
import { DISTRACTION_REASONS } from "@/utils/constants";
import { nowIso } from "@/utils/date";
import { uid } from "@/utils/id";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;
let dbInitialized = false;

type RowData = Record<string, unknown>;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("focomax.db");
  }
  return dbPromise;
}

export async function run(sql: string, params: unknown[] = []) {
  const db = await getDb();
  return db.runAsync(sql, params as SQLite.SQLiteBindParams);
}

export async function getAll<T>(sql: string, params: unknown[] = []) {
  const db = await getDb();
  return db.getAllAsync<T>(sql, params as SQLite.SQLiteBindParams);
}

export async function getFirst<T>(sql: string, params: unknown[] = []) {
  const db = await getDb();
  return db.getFirstAsync<T>(sql, params as SQLite.SQLiteBindParams);
}

export async function insert(table: string, data: RowData) {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
  await run(sql, keys.map((key) => data[key] ?? null));
}

export async function updateById(table: string, id: string, data: RowData) {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return;
  }
  const assigns = keys.map((key) => `${key} = ?`).join(", ");
  const sql = `UPDATE ${table} SET ${assigns} WHERE id = ?`;
  await run(sql, [...keys.map((key) => data[key] ?? null), id]);
}

export async function archiveById(table: string, id: string) {
  await updateById(table, id, { is_archived: 1, archived_at: nowIso(), updated_at: nowIso() });
}

export async function deleteById(table: string, id: string) {
  await run(`DELETE FROM ${table} WHERE id = ?`, [id]);
}

export async function initDatabase(force = false) {
  if (force) {
    dbInitialized = false;
  }

  if (dbInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const db = await getDb();
    await db.execAsync("PRAGMA foreign_keys = ON;");

    for (const statement of schemaStatements) {
      await db.execAsync(statement);
    }

    await ensureDefaultUser();
    await ensureDefaultReasons();
    await ensureDefaultCategories();
    await ensureDefaultRewards();
    dbInitialized = true;
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
}

async function ensureDefaultUser() {
  const existing = await getFirst<{ id: string }>("SELECT id FROM usuario_local LIMIT 1");
  if (existing?.id) {
    return;
  }

  const now = nowIso();
  const userId = uid("usr");
  const profileId = uid("prf");

  await insert("usuario_local", {
    id: userId,
    nome: "Usuário Local",
    objetivo_principal: "Criar disciplina",
    nivel_dificuldade: "médio",
    modo_uso: "equilibrado",
    onboarding_concluido: 0,
    created_at: now,
    updated_at: now
  });

  await insert("perfil_usuario", {
    id: profileId,
    usuario_id: userId,
    nivel: 1,
    xp_total: 0,
    foco_acumulado_min: 0,
    tarefas_concluidas: 0,
    habitos_mantidos: 0,
    dias_uso: 0,
    created_at: now,
    updated_at: now
  });

  await insert("configuracoes_app", {
    id: uid("cfg"),
    usuario_id: userId,
    tema: "auto",
    created_at: now,
    updated_at: now
  });

  await insert("preferencia_visual", {
    id: uid("vis"),
    usuario_id: userId,
    tema: "auto",
    created_at: now,
    updated_at: now
  });

  await insert("anuncios_estado", {
    id: uid("ads"),
    usuario_id: userId,
    habilitado: 1,
    exibicoes_hoje: 0,
    created_at: now,
    updated_at: now
  });

  await insert("assinatura_local", {
    id: uid("sub"),
    usuario_id: userId,
    plano: "free",
    premium_ativo: 0,
    anuncios_removidos: 0,
    compra_simulada: 1,
    created_at: now,
    updated_at: now
  });

  await insert("streaks", {
    id: uid("stk"),
    usuario_id: userId,
    tipo: "foco",
    atual: 0,
    recorde: 0,
    created_at: now,
    updated_at: now
  });

  await insert("streaks", {
    id: uid("stk"),
    usuario_id: userId,
    tipo: "habito",
    atual: 0,
    recorde: 0,
    created_at: now,
    updated_at: now
  });
}

async function ensureDefaultReasons() {
  const count = await getFirst<{ total: number }>("SELECT COUNT(*) as total FROM motivos_distracao");
  if ((count?.total ?? 0) > 0) {
    return;
  }

  const now = nowIso();
  for (const reason of DISTRACTION_REASONS) {
    await insert("motivos_distracao", {
      id: uid("dst"),
      nome: reason,
      categoria: "padrão",
      ativo: 1,
      created_at: now,
      updated_at: now
    });
  }
}

async function ensureDefaultCategories() {
  const count = await getFirst<{ total: number }>("SELECT COUNT(*) as total FROM categorias");
  if ((count?.total ?? 0) > 0) {
    return;
  }

  const now = nowIso();
  const defaults = [
    { nome: "Estudos", cor: "#3B82F6", tipo: "tarefa" },
    { nome: "Trabalho", cor: "#10B981", tipo: "tarefa" },
    { nome: "Saúde", cor: "#F59E0B", tipo: "habito" },
    { nome: "Disciplina", cor: "#8B5CF6", tipo: "meta" }
  ];

  for (const category of defaults) {
    await insert("categorias", {
      id: uid("cat"),
      nome: category.nome,
      cor: category.cor,
      tipo: category.tipo,
      created_at: now,
      updated_at: now
    });
  }
}

async function ensureDefaultRewards() {
  const count = await getFirst<{ total: number }>("SELECT COUNT(*) as total FROM recompensas");
  if ((count?.total ?? 0) > 0) {
    return;
  }

  const now = nowIso();
  const rewards = [
    {
      chave: "tema_oceano",
      nome: "Tema Oceano",
      tipo: "tema",
      criterio: "Concluir 10 sessões de foco",
      premium: 0
    },
    {
      chave: "som_montanha",
      nome: "Som Montanha",
      tipo: "som",
      criterio: "Manter streak de 7 dias",
      premium: 0
    },
    {
      chave: "moldura_lendaria",
      nome: "Moldura Lendária",
      tipo: "moldura",
      criterio: "Alcançar nível 10",
      premium: 1
    }
  ];

  for (const reward of rewards) {
    await insert("recompensas", {
      id: uid("rwd"),
      chave: reward.chave,
      nome: reward.nome,
      tipo: reward.tipo,
      criterio: reward.criterio,
      premium: reward.premium,
      desbloqueada: 0,
      created_at: now,
      updated_at: now
    });
  }
}

export async function getCurrentUserId() {
  const row = await getFirst<{ id: string }>("SELECT id FROM usuario_local LIMIT 1");
  if (!row?.id) {
    await ensureDefaultUser();
    const ensured = await getFirst<{ id: string }>("SELECT id FROM usuario_local LIMIT 1");
    return ensured?.id ?? "";
  }
  return row.id;
}
