import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { getAll, getCurrentUserId, getDb, getFirst, insert, run, updateById } from "@/db/database";
import { nowIso } from "@/utils/date";
import { uid } from "@/utils/id";

type BackupPayload = {
  createdAt: string;
  app: string;
  version: string;
  tables: Record<string, Array<Record<string, unknown>>>;
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

export async function exportBackupLocally() {
  const now = nowIso();
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

  if (await Sharing.isAvailableAsync()) {
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
