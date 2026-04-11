import { PremiumState } from "@/models/types";

export type PremiumFeatureKey =
  | "remove_ads"
  | "full_coach"
  | "advanced_behavior"
  | "unlimited_focus_history"
  | "advanced_reports"
  | "advanced_exports"
  | "premium_themes"
  | "premium_challenges"
  | "smart_planning";

export type PremiumCapabilities = Record<PremiumFeatureKey, boolean>;

export const PREMIUM_FEATURE_LABELS: Record<PremiumFeatureKey, string> = {
  remove_ads: "Remoção total de anúncios",
  full_coach: "Coach completo com recomendações avançadas",
  advanced_behavior: "Análises de comportamento com correlações completas",
  unlimited_focus_history: "Histórico ilimitado de sessões",
  advanced_reports: "Relatórios avançados de desempenho",
  advanced_exports: "Exportação avançada (JSON + CSV)",
  premium_themes: "Temas e personalização premium",
  premium_challenges: "Desafios premium adaptativos",
  smart_planning: "Planejamento inteligente com auto-ajustes"
};

export const PREMIUM_FEATURE_DESCRIPTIONS: Record<PremiumFeatureKey, string> = {
  remove_ads: "Sem interrupções de anúncio em toda a experiência.",
  full_coach: "Mais recomendações simultâneas, priorização e histórico de utilidade.",
  advanced_behavior: "Visões detalhadas de horários, gatilhos e relação energia-humor-produtividade.",
  unlimited_focus_history: "Acesso completo ao histórico para comparação e revisão.",
  advanced_reports: "Resumos avançados por período com leitura orientada a ação.",
  advanced_exports: "Exportação de dados estruturada para análise externa.",
  premium_themes: "Aparência premium e refinamentos visuais exclusivos.",
  premium_challenges: "Missões com ajuste dinâmico ao seu ritmo real.",
  smart_planning: "Sugestões automáticas de blocos e rotina para o dia/semana."
};

export function getPremiumCapabilities(state: PremiumState): PremiumCapabilities {
  const premiumOn = Boolean(state.premium_active);
  const adsRemoved = Boolean(state.ads_removed) || premiumOn;

  return {
    remove_ads: adsRemoved,
    full_coach: premiumOn,
    advanced_behavior: premiumOn,
    unlimited_focus_history: premiumOn,
    advanced_reports: premiumOn,
    advanced_exports: premiumOn,
    premium_themes: premiumOn,
    premium_challenges: premiumOn,
    smart_planning: premiumOn
  };
}

export function getLockedPremiumFeatures(capabilities: PremiumCapabilities) {
  return (Object.keys(capabilities) as PremiumFeatureKey[]).filter((key) => !capabilities[key]);
}
