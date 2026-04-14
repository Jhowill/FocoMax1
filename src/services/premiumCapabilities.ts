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
  | "smart_planning"
  | "weekly_plan"
  | "long_term_trends"
  | "premium_visual_finishing"
  | "auto_backup_pro";

export type PremiumCapabilities = Record<PremiumFeatureKey, boolean>;

export const PREMIUM_FEATURE_LABELS: Record<PremiumFeatureKey, string> = {
  remove_ads: "Remocao total de anuncios",
  full_coach: "Coach completo com recomendacoes avancadas",
  advanced_behavior: "Analises de comportamento com correlacoes completas",
  unlimited_focus_history: "Historico ilimitado de sessoes",
  advanced_reports: "Relatorios avancados de desempenho",
  advanced_exports: "Exportacao avancada (JSON + CSV)",
  premium_themes: "Temas e personalizacao premium",
  premium_challenges: "Desafios premium adaptativos",
  smart_planning: "Planejamento inteligente com auto-ajustes",
  weekly_plan: "Plano semanal personalizado",
  long_term_trends: "Tendencias comparativas de longo prazo",
  premium_visual_finishing: "Acabamento visual premium e microinteracoes",
  auto_backup_pro: "Backup automatico premium com controle de intervalo"
};

export const PREMIUM_FEATURE_DESCRIPTIONS: Record<PremiumFeatureKey, string> = {
  remove_ads: "Sem interrupcoes de anuncio em toda a experiencia.",
  full_coach: "Mais recomendacoes simultaneas, priorizacao e historico de utilidade.",
  advanced_behavior: "Visoes detalhadas de horarios, gatilhos e relacao energia-humor-produtividade.",
  unlimited_focus_history: "Acesso completo ao historico para comparacao e revisao.",
  advanced_reports: "Resumos avancados por periodo com leitura orientada a acao.",
  advanced_exports: "Exportacao de dados estruturada para analise externa.",
  premium_themes: "Aparencia premium e refinamentos visuais exclusivos.",
  premium_challenges: "Missoes com ajuste dinamico ao seu ritmo real.",
  smart_planning: "Sugestoes automaticas de blocos e rotina para o dia/semana.",
  weekly_plan: "Plano semanal com foco, tarefas e habitos sugeridos.",
  long_term_trends: "Comparativos mensal x mensal e tendencia de consistencia.",
  premium_visual_finishing: "Interface premium com feedbacks visuais e experiencia superior.",
  auto_backup_pro: "Backup automatico local com intervalo configuravel."
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
    smart_planning: premiumOn,
    weekly_plan: premiumOn,
    long_term_trends: premiumOn,
    premium_visual_finishing: premiumOn,
    auto_backup_pro: premiumOn
  };
}

export function getLockedPremiumFeatures(capabilities: PremiumCapabilities) {
  return (Object.keys(capabilities) as PremiumFeatureKey[]).filter((key) => !capabilities[key]);
}
