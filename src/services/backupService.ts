import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { getAll, getCurrentUserId, getDb, getFirst, insert, run, updateById } from "@/db/database";
import { getBoolPref, getStringPref } from "@/services/localPrefsService";
import { nowIso } from "@/utils/date";
import { uid } from "@/utils/id";

type BackupPayload = {
  createdAt: string;
  app: string;
  version: string;
  tables: Record<string, Record<string, unknown>[]>;
};

const EXPORT_TABLES = [
  "usuario_local",
  "perfil_usuario",
  "configuracoes_app",
  "objetivos",
  "areas_vida",
  "metas",
  "tarefas",
  "subtarefas",
  "sessoes_foco",
  "sessoes_livres",
  "pausas",
  "interrupcoes",
  "motivos_distracao",
  "habitos",
  "registros_habito",
  "humor_energia",
  "recompensas",
  "conquistas",
  "streaks",
  "estatisticas_diarias",
  "estatisticas_semanais",
  "estatisticas_mensais",
  "notas_reflexao",
  "categorias",
  "tags",
  "tarefa_tags",
  "anuncios_estado",
  "assinatura_local",
  "backup_metadata",
  "historico_acao",
  "preferencia_visual",
  "sugestoes_coach"
];

export async function exportBackupLocally(options?: { share?: boolean; reason?: "manual" | "auto" }) {
  const now = nowIso();
  const shouldShare = options?.share ?? true;
  const tables: BackupPayload["tables"] = {};

  for (const table of EXPORT_TABLES) {
    tables[table] = await getAll<Record<string, unknown>>(`SELECT * FROM ${table}`);
  }

  const payload: BackupPayload = {
    createdAt: now,
    app: "FocoMax",
    version: "1.0.0",
    tables
  };

  const filePath = `${FileSystem.documentDirectory}focomax-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8
  });

  await registerBackupMetadata(filePath);

  if (shouldShare && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(filePath);
  }

  return filePath;
}

export async function importBackupFromFilePicker() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
    multiple: false
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return { imported: false, reason: "cancelado" };
  }

  const raw = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8
  });
  const parsed = JSON.parse(raw) as BackupPayload;

  if (!parsed.tables || typeof parsed.tables !== "object") {
    return { imported: false, reason: "arquivo inválido" };
  }

  await restorePayload(parsed);
  await registerBackupMetadata(result.assets[0].uri);
  return { imported: true, reason: "ok" };
}

export async function getLastBackupMetadata() {
  const userId = await getCurrentUserId();
  return getFirst<{ ultimo_backup_em: string; caminho_arquivo: string }>(
    "SELECT ultimo_backup_em, caminho_arquivo FROM backup_metadata WHERE usuario_id = ? ORDER BY updated_at DESC LIMIT 1",
    [userId]
  );
}

export async function wipeAllDataAndRecreate() {
  const db = await getDb();
  await db.execAsync("PRAGMA foreign_keys = OFF;");
  await db.execAsync("BEGIN;");
  try {
    for (const table of EXPORT_TABLES) {
      await run(`DELETE FROM ${table}`);
    }
    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  } finally {
    await db.execAsync("PRAGMA foreign_keys = ON;");
  }
}

export async function runAutoBackupIfNeeded() {
  const autoEnabled = await getBoolPref("auto_backup_enabled");
  if (!autoEnabled) {
    return { executed: false, reason: "disabled" as const };
  }

  const intervalHours = Math.max(1, Number(await getStringPref("auto_backup_interval_hours")) || 24);
  const last = await getLastBackupMetadata();

  if (last?.ultimo_backup_em) {
    const elapsedMs = Date.now() - new Date(last.ultimo_backup_em).getTime();
    const elapsedHours = elapsedMs / 3600000;
    if (elapsedHours < intervalHours) {
      return {
        executed: false,
        reason: "interval_not_reached" as const,
        nextInHours: Number((intervalHours - elapsedHours).toFixed(1))
      };
    }
  }

  const path = await exportBackupLocally({ share: false, reason: "auto" });
  return {
    executed: true,
    reason: "ok" as const,
    path
  };
}

export async function exportPremiumCsvReport() {
  const userId = await getCurrentUserId();
  const now = nowIso();

  const [taskRows, habitRows, focusRows, monthlyRows] = await Promise.all([
    getAll<{ id: string; titulo: string; status: string; prioridade: number; data_prevista?: string | null }>(
      `
      SELECT id, titulo, status, prioridade, data_prevista
      FROM tarefas
      WHERE usuario_id = ? AND is_archived = 0
      ORDER BY updated_at DESC
      LIMIT 200
      `,
      [userId]
    ),
    getAll<{ id: string; nome: string; frequencia: string; ativo: number }>(
      `
      SELECT id, nome, frequencia, ativo
      FROM habitos
      WHERE usuario_id = ? AND is_archived = 0
      ORDER BY updated_at DESC
      LIMIT 200
      `,
      [userId]
    ),
    getAll<{ id: string; modo: string; status: string; duracao_real_segundos: number; started_at: string }>(
      `
      SELECT id, modo, status, duracao_real_segundos, started_at
      FROM sessoes_foco
      WHERE usuario_id = ?
      ORDER BY started_at DESC
      LIMIT 300
      `,
      [userId]
    ),
    getAll<{ ano_mes: string; foco_min: number; tarefas_concluidas: number; habitos_concluidos: number; taxa_consistencia: number }>(
      `
      SELECT ano_mes, foco_min, tarefas_concluidas, habitos_concluidos, taxa_consistencia
      FROM estatisticas_mensais
      WHERE usuario_id = ?
      ORDER BY ano_mes DESC
      LIMIT 12
      `,
      [userId]
    )
  ]);

  const lines: string[] = [];
  lines.push("secao,id,campo1,campo2,campo3,campo4");
  for (const row of taskRows) {
    lines.push(toCsvRow(["tarefas", row.id, row.titulo, row.status, `${row.prioridade}`, row.data_prevista ?? ""]));
  }
  for (const row of habitRows) {
    lines.push(toCsvRow(["habitos", row.id, row.nome, row.frequencia, row.ativo ? "ativo" : "inativo", ""]));
  }
  for (const row of focusRows) {
    lines.push(
      toCsvRow([
        "sessoes_foco",
        row.id,
        row.modo,
        row.status,
        `${Math.round((row.duracao_real_segundos ?? 0) / 60)}`,
        row.started_at
      ])
    );
  }
  for (const row of monthlyRows) {
    lines.push(
      toCsvRow([
        "estatisticas_mensais",
        row.ano_mes,
        `${row.foco_min ?? 0}`,
        `${row.tarefas_concluidas ?? 0}`,
        `${row.habitos_concluidos ?? 0}`,
        `${row.taxa_consistencia ?? 0}`
      ])
    );
  }

  const filePath = `${FileSystem.documentDirectory}focomax-premium-report-${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(filePath, lines.join("\n"), {
    encoding: FileSystem.EncodingType.UTF8
  });

  await registerBackupMetadata(filePath);
  await run(
    `
    INSERT INTO historico_acao (id, usuario_id, entidade, entidade_id, acao, payload_json, created_at, updated_at)
    VALUES (?, ?, 'exportacao', ?, 'csv_premium', ?, ?, ?)
    `,
    [uid("hac"), userId, uid("exp"), JSON.stringify({ filePath }), now, now]
  );

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath);
  }

  return filePath;
}

async function restorePayload(payload: BackupPayload) {
  const db = await getDb();
  await db.execAsync("PRAGMA foreign_keys = OFF;");
  await db.execAsync("BEGIN;");

  try {
    for (const table of EXPORT_TABLES) {
      await run(`DELETE FROM ${table}`);
    }

    for (const table of EXPORT_TABLES) {
      const rows = payload.tables[table] ?? [];
      for (const row of rows) {
        await insert(table, row);
      }
    }
    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  } finally {
    await db.execAsync("PRAGMA foreign_keys = ON;");
  }
}

async function registerBackupMetadata(path: string) {
  const userId = await getCurrentUserId();
  const now = nowIso();
  const existing = await getFirst<{ id: string }>("SELECT id FROM backup_metadata WHERE usuario_id = ? LIMIT 1", [userId]);
  if (existing?.id) {
    await updateById("backup_metadata", existing.id, {
      ultimo_backup_em: now,
      caminho_arquivo: path,
      versao_schema: 1,
      updated_at: now
    });
    return;
  }
  await insert("backup_metadata", {
    id: uid("bkp"),
    usuario_id: userId,
    ultimo_backup_em: now,
    caminho_arquivo: path,
    versao_schema: 1,
    created_at: now,
    updated_at: now
  });
}

function toCsvRow(values: string[]) {
  return values.map(escapeCsv).join(",");
}

function escapeCsv(value: string) {
  const normalized = value.replaceAll('"', '""');
  return `"${normalized}"`;
}
