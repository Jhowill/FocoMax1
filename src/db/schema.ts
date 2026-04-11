export const schemaStatements: string[] = [
  `
  CREATE TABLE IF NOT EXISTS usuario_local (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    objetivo_principal TEXT,
    nivel_dificuldade TEXT,
    modo_uso TEXT,
    onboarding_concluido INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS perfil_usuario (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    nivel INTEGER DEFAULT 1,
    xp_total INTEGER DEFAULT 0,
    foco_acumulado_min INTEGER DEFAULT 0,
    tarefas_concluidas INTEGER DEFAULT 0,
    habitos_mantidos INTEGER DEFAULT 0,
    dias_uso INTEGER DEFAULT 0,
    avatar_local TEXT,
    moldura_perfil TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS configuracoes_app (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    tema TEXT DEFAULT 'auto',
    tamanho_fonte REAL DEFAULT 1.0,
    reduzir_animacoes INTEGER DEFAULT 0,
    duracao_foco_padrao_min INTEGER DEFAULT 25,
    pausa_curta_min INTEGER DEFAULT 5,
    pausa_longa_min INTEGER DEFAULT 15,
    ciclos_pomodoro INTEGER DEFAULT 4,
    foco_livre_padrao_min INTEGER DEFAULT 45,
    som_selecionado TEXT DEFAULT 'campainha_1',
    vibracao_ativa INTEGER DEFAULT 1,
    pausa_auto_inicio INTEGER DEFAULT 0,
    proxima_sessao_auto_inicio INTEGER DEFAULT 0,
    lembrete_foco INTEGER DEFAULT 1,
    lembrete_habito INTEGER DEFAULT 1,
    lembrete_tarefa INTEGER DEFAULT 1,
    resumo_dia INTEGER DEFAULT 1,
    resumo_semana INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS objetivos (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'ativo',
    prioridade INTEGER DEFAULT 2,
    is_archived INTEGER DEFAULT 0,
    archived_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS areas_vida (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    cor TEXT,
    icone TEXT,
    is_archived INTEGER DEFAULT 0,
    archived_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS metas (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    area_id TEXT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    prazo TEXT,
    progresso_percentual REAL DEFAULT 0,
    status TEXT DEFAULT 'ativa',
    previsao_conclusao TEXT,
    is_archived INTEGER DEFAULT 0,
    archived_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id),
    FOREIGN KEY (area_id) REFERENCES areas_vida(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS tarefas (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    meta_id TEXT,
    area_id TEXT,
    categoria_id TEXT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    prioridade INTEGER DEFAULT 2,
    data_prevista TEXT,
    hora_prevista TEXT,
    duracao_estimada_min INTEGER,
    repetir_regra TEXT,
    observacoes TEXT,
    status TEXT DEFAULT 'pendente',
    concluida_em TEXT,
    is_archived INTEGER DEFAULT 0,
    archived_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id),
    FOREIGN KEY (meta_id) REFERENCES metas(id),
    FOREIGN KEY (area_id) REFERENCES areas_vida(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS subtarefas (
    id TEXT PRIMARY KEY,
    tarefa_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    concluida INTEGER DEFAULT 0,
    ordem INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS sessoes_foco (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    tarefa_id TEXT,
    objetivo_id TEXT,
    modo TEXT NOT NULL,
    duracao_planejada_min INTEGER NOT NULL,
    duracao_real_segundos INTEGER DEFAULT 0,
    interrupcoes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'concluida',
    dificuldade INTEGER,
    foco_nivel INTEGER,
    houve_distracao INTEGER DEFAULT 0,
    motivo_distracao_id TEXT,
    nota_rapida TEXT,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id),
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id),
    FOREIGN KEY (objetivo_id) REFERENCES objetivos(id),
    FOREIGN KEY (motivo_distracao_id) REFERENCES motivos_distracao(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS sessoes_livres (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    titulo TEXT,
    duracao_segundos INTEGER NOT NULL,
    dificuldade INTEGER,
    foco_nivel INTEGER,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS pausas (
    id TEXT PRIMARY KEY,
    sessao_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    duracao_segundos INTEGER,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (sessao_id) REFERENCES sessoes_foco(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS interrupcoes (
    id TEXT PRIMARY KEY,
    sessao_id TEXT NOT NULL,
    motivo_id TEXT,
    descricao TEXT,
    momento_segundo INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (sessao_id) REFERENCES sessoes_foco(id),
    FOREIGN KEY (motivo_id) REFERENCES motivos_distracao(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS motivos_distracao (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT,
    ativo INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS habitos (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    categoria_id TEXT,
    nome TEXT NOT NULL,
    descricao TEXT,
    frequencia TEXT NOT NULL,
    melhor_horario TEXT,
    meta_semanal INTEGER DEFAULT 3,
    tipo TEXT,
    dificuldade TEXT,
    cor TEXT,
    icone TEXT,
    lembrete_local INTEGER DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    is_archived INTEGER DEFAULT 0,
    archived_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS registros_habito (
    id TEXT PRIMARY KEY,
    habito_id TEXT NOT NULL,
    data_ref TEXT NOT NULL,
    status TEXT NOT NULL,
    nota TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (habito_id) REFERENCES habitos(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS humor_energia (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    data_ref TEXT NOT NULL,
    humor INTEGER NOT NULL,
    energia INTEGER NOT NULL,
    dificuldade_foco INTEGER NOT NULL,
    procrastinacao_motivo TEXT,
    nota TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS recompensas (
    id TEXT PRIMARY KEY,
    chave TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    criterio TEXT NOT NULL,
    premium INTEGER DEFAULT 0,
    desbloqueada INTEGER DEFAULT 0,
    desbloqueada_em TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS conquistas (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    chave TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    descricao TEXT,
    desbloqueada_em TEXT NOT NULL,
    xp_bonus INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS streaks (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    atual INTEGER DEFAULT 0,
    recorde INTEGER DEFAULT 0,
    ultimo_registro_data TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS estatisticas_diarias (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    data_ref TEXT NOT NULL UNIQUE,
    foco_min INTEGER DEFAULT 0,
    sessoes_concluidas INTEGER DEFAULT 0,
    sessoes_interrompidas INTEGER DEFAULT 0,
    tarefas_concluidas INTEGER DEFAULT 0,
    habitos_concluidos INTEGER DEFAULT 0,
    xp_ganho INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS estatisticas_semanais (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    ano_semana TEXT NOT NULL UNIQUE,
    foco_min INTEGER DEFAULT 0,
    sessoes_concluidas INTEGER DEFAULT 0,
    tarefas_concluidas INTEGER DEFAULT 0,
    habitos_concluidos INTEGER DEFAULT 0,
    taxa_consistencia REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS estatisticas_mensais (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    ano_mes TEXT NOT NULL UNIQUE,
    foco_min INTEGER DEFAULT 0,
    sessoes_concluidas INTEGER DEFAULT 0,
    tarefas_concluidas INTEGER DEFAULT 0,
    habitos_concluidos INTEGER DEFAULT 0,
    taxa_consistencia REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS notas_reflexao (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    data_ref TEXT NOT NULL,
    titulo TEXT,
    nota TEXT NOT NULL,
    humor INTEGER,
    produtividade INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS categorias (
    id TEXT PRIMARY KEY,
    usuario_id TEXT,
    nome TEXT NOT NULL,
    cor TEXT,
    icone TEXT,
    tipo TEXT DEFAULT 'geral',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    usuario_id TEXT,
    nome TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS tarefa_tags (
    id TEXT PRIMARY KEY,
    tarefa_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS anuncios_estado (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    habilitado INTEGER DEFAULT 1,
    exibicoes_hoje INTEGER DEFAULT 0,
    ultima_exibicao_em TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS assinatura_local (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    plano TEXT DEFAULT 'free',
    premium_ativo INTEGER DEFAULT 0,
    anuncios_removidos INTEGER DEFAULT 0,
    expiracao_em TEXT,
    compra_simulada INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS backup_metadata (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    ultimo_backup_em TEXT,
    caminho_arquivo TEXT,
    versao_schema INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS historico_acao (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    entidade TEXT NOT NULL,
    entidade_id TEXT NOT NULL,
    acao TEXT NOT NULL,
    payload_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS preferencia_visual (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    tema TEXT DEFAULT 'auto',
    cor_principal TEXT DEFAULT '#3B82F6',
    tamanho_fonte REAL DEFAULT 1.0,
    reduzir_animacoes INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS sugestoes_coach (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    texto TEXT NOT NULL,
    util_status TEXT DEFAULT 'pendente',
    is_ativa INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario_local(id)
  );
  `,
  "CREATE INDEX IF NOT EXISTS idx_tarefas_status_data ON tarefas(status, data_prevista);",
  "CREATE INDEX IF NOT EXISTS idx_sessoes_foco_started ON sessoes_foco(started_at);",
  "CREATE INDEX IF NOT EXISTS idx_registros_habito_data ON registros_habito(data_ref);",
  "CREATE INDEX IF NOT EXISTS idx_humor_energia_data ON humor_energia(data_ref);",
  "CREATE INDEX IF NOT EXISTS idx_historico_entidade ON historico_acao(entidade, entidade_id);"
];
