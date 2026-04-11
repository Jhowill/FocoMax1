import { getCurrentUserId, getFirst, updateById } from "@/db/database";
import { PremiumState } from "@/models/types";
import { getPremiumCapabilities } from "@/services/premiumCapabilities";
import { nowIso } from "@/utils/date";

export async function getPremiumState(): Promise<PremiumState> {
  const userId = await getCurrentUserId();
  const row = await getFirst<{ plano: "free" | "premium"; premium_ativo: number; anuncios_removidos: number }>(
    "SELECT plano, premium_ativo, anuncios_removidos FROM assinatura_local WHERE usuario_id = ? LIMIT 1",
    [userId]
  );

  return {
    plan: row?.plano ?? "free",
    premium_active: row?.premium_ativo ?? 0,
    ads_removed: row?.anuncios_removidos ?? 0
  };
}

export async function simulatePurchasePremium() {
  const userId = await getCurrentUserId();
  const current = await getFirst<{ id: string }>("SELECT id FROM assinatura_local WHERE usuario_id = ? LIMIT 1", [userId]);
  if (!current?.id) {
    return;
  }
  await updateById("assinatura_local", current.id, {
    plano: "premium",
    premium_ativo: 1,
    anuncios_removidos: 1,
    updated_at: nowIso()
  });
}

export async function simulateRemoveAdsPurchase() {
  const userId = await getCurrentUserId();
  const current = await getFirst<{ id: string }>("SELECT id FROM assinatura_local WHERE usuario_id = ? LIMIT 1", [userId]);
  if (!current?.id) {
    return;
  }
  await updateById("assinatura_local", current.id, {
    anuncios_removidos: 1,
    updated_at: nowIso()
  });
}

export async function restorePurchases() {
  // Em ambiente local, restauração equivale a reler flags já persistidas.
  return getPremiumState();
}

export async function shouldShowAd() {
  const state = await getPremiumState();
  const capabilities = getPremiumCapabilities(state);
  return !capabilities.remove_ads;
}
