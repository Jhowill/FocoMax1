import { getCurrentUserId, getFirst, updateById } from "@/db/database";
import { LocalUser } from "@/models/types";
import { nowIso } from "@/utils/date";

export async function getLocalUser() {
  return getFirst<LocalUser>("SELECT * FROM usuario_local LIMIT 1");
}

export async function updateLocalUser(data: Partial<LocalUser>) {
  const userId = await getCurrentUserId();
  await updateById("usuario_local", userId, {
    nome: data.nome,
    objetivo_principal: data.objetivo_principal,
    nivel_dificuldade: data.nivel_dificuldade,
    modo_uso: data.modo_uso,
    onboarding_concluido: data.onboarding_concluido,
    updated_at: nowIso()
  });
}

export async function getProfileSummary() {
  const userId = await getCurrentUserId();
  const user = await getFirst<{
    nome: string;
    objetivo_principal: string;
    created_at: string;
  }>("SELECT nome, objetivo_principal, created_at FROM usuario_local WHERE id = ? LIMIT 1", [userId]);

  const profile = await getFirst<{
    nivel: number;
    xp_total: number;
    foco_acumulado_min: number;
    tarefas_concluidas: number;
    habitos_mantidos: number;
    dias_uso: number;
  }>("SELECT nivel, xp_total, foco_acumulado_min, tarefas_concluidas, habitos_mantidos, dias_uso FROM perfil_usuario WHERE usuario_id = ? LIMIT 1", [
    userId
  ]);

  const achievements = await getFirst<{ total: number }>("SELECT COUNT(*) as total FROM conquistas WHERE usuario_id = ?", [userId]);
  const usageDays = await getFirst<{ total: number }>(
    `
    SELECT COUNT(*) as total
    FROM estatisticas_diarias
    WHERE usuario_id = ? AND (foco_min > 0 OR tarefas_concluidas > 0 OR habitos_concluidos > 0)
    `,
    [userId]
  );

  return {
    user,
    profile: {
      ...profile,
      dias_uso: usageDays?.total ?? profile?.dias_uso ?? 0
    },
    achievements: achievements?.total ?? 0
  };
}

export async function getAppSettings() {
  const userId = await getCurrentUserId();
  return getFirst<Record<string, unknown>>("SELECT * FROM configuracoes_app WHERE usuario_id = ? LIMIT 1", [userId]);
}

export async function updateAppSettings(data: Record<string, unknown>) {
  const userId = await getCurrentUserId();
  const existing = await getFirst<{ id: string }>("SELECT id FROM configuracoes_app WHERE usuario_id = ? LIMIT 1", [userId]);
  if (!existing?.id) {
    return;
  }
  await updateById("configuracoes_app", existing.id, {
    ...data,
    updated_at: nowIso()
  });
}
