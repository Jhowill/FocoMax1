import { getCurrentUserId, insert } from "@/db/database";
import { nowIso } from "@/utils/date";
import { uid } from "@/utils/id";

export async function logAction(entidade: string, entidadeId: string, acao: string, payload?: unknown) {
  const userId = await getCurrentUserId();
  const now = nowIso();

  await insert("historico_acao", {
    id: uid("hist"),
    usuario_id: userId,
    entidade: entidade,
    entidade_id: entidadeId,
    acao,
    payload_json: payload ? JSON.stringify(payload) : null,
    created_at: now,
    updated_at: now
  });
}
