export type ID = string;

export type PlanType = "free" | "premium";
export type FocusMode = "pomodoro_classico" | "pomodoro_custom" | "foco_livre" | "foco_blocos" | "sessao_rapida";
export type TaskStatus = "pendente" | "em_andamento" | "concluida" | "arquivada";
export type HabitRecordStatus = "concluido" | "falhou" | "ignorado";

export interface TimeStamped {
  id: ID;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  is_archived?: number;
}

export interface LocalUser extends TimeStamped {
  nome: string;
  objetivo_principal: string;
  nivel_dificuldade: string;
  modo_uso: string;
  onboarding_concluido: number;
}

export interface Task extends TimeStamped {
  titulo: string;
  descricao?: string;
  categoria_id?: ID | null;
  prioridade: number;
  data_prevista?: string | null;
  hora_prevista?: string | null;
  duracao_estimada_min?: number | null;
  status: TaskStatus;
  meta_id?: ID | null;
  area_id?: ID | null;
  repetir_regra?: string | null;
  observacoes?: string | null;
  concluida_em?: string | null;
}

export interface Habit extends TimeStamped {
  nome: string;
  descricao?: string | null;
  frequencia: string;
  melhor_horario?: string | null;
  meta_semanal?: number | null;
  tipo?: string | null;
  dificuldade?: string | null;
  cor?: string | null;
  icone?: string | null;
  categoria_id?: ID | null;
  ativo: number;
}

export interface Goal extends TimeStamped {
  titulo: string;
  descricao?: string | null;
  prazo?: string | null;
  progresso_percentual: number;
  status: "ativa" | "concluida" | "arquivada";
  area_id?: ID | null;
}

export interface FocusSession extends TimeStamped {
  tarefa_id?: ID | null;
  objetivo_id?: ID | null;
  modo: FocusMode;
  duracao_planejada_min: number;
  duracao_real_segundos: number;
  interrupcoes: number;
  status: "em_andamento" | "concluida" | "interrompida" | "cancelada";
  dificuldade?: number | null;
  foco_nivel?: number | null;
  houve_distracao?: number;
  motivo_distracao_id?: ID | null;
  nota_rapida?: string | null;
  started_at: string;
  ended_at?: string | null;
}

export interface MoodEnergy extends TimeStamped {
  data_ref: string;
  humor: number;
  energia: number;
  dificuldade_foco: number;
  procrastinacao_motivo?: string | null;
  nota?: string | null;
}

export interface Suggestion extends TimeStamped {
  texto: string;
  tipo: string;
  util_status: "pendente" | "util" | "ignorado" | "favorita";
}

export interface PremiumState {
  plan: PlanType;
  premium_active: number;
  ads_removed: number;
}
