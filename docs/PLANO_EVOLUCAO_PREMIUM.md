# Plano de Evolução do FocoMax (com foco Premium)

## 1) Revisão geral do app atual

### Pontos fortes já implementados
- Fluxo central do produto está presente: planejar -> focar -> registrar -> analisar.
- Base offline-first com SQLite local e sem backend obrigatório no núcleo.
- Entidades e histórico amplos para evolução (tarefas, hábitos, metas, foco, distrações, humor, coach, gamificação, assinatura local).
- Navegação principal e secundária já bem distribuída.

### Principais lacunas atuais
- Diferenciação Premium ainda está mais em limitação de volume do que em experiências realmente superiores.
- Gating Premium está espalhado; falta um mapa único de capacidades.
- Paywall (tela Premium) ainda não comunica valor com profundidade por cenário de uso.
- Coach e análise avançada existem, mas faltam “insights premium de alto valor” com ação sugerida.
- Microinterações e acabamento visual ainda estão homogêneos entre Free e Premium.

## 2) Estratégia de posicionamento Premium (objetivo)

O Premium precisa ser percebido como:
- melhor resultado por semana;
- mais clareza para decidir o que fazer;
- execução com menos atrito;
- sensação de produto “pro”.

Não só “sem anúncios”, e sim “mais inteligência, mais controle, mais resultado”.

## 3) Diferenciação Free vs Premium (proposta forte)

## Free (forte e honesto)
- tarefas, hábitos, metas e foco completos;
- histórico limitado;
- coach parcial;
- estatísticas essenciais;
- anúncios leves em momentos seguros.

## Premium (claramente superior)
- histórico ilimitado e busca avançada;
- painel avançado com correlações (humor x foco, energia x conclusão, duração ideal por contexto);
- coach completo com recomendações priorizadas por impacto;
- plano semanal automático (auto-ajuste de metas e blocos de foco);
- simulação de desempenho (previsão de conclusão de metas);
- desafios premium adaptativos;
- exportação avançada (JSON + CSV estruturado);
- temas premium e microinterações reforçadas;
- remoção permanente de anúncios.

## 4) Roadmap técnico por fases

### Fase 1 (imediata, 1 sprint)
- Centralizar capacidades Premium em um serviço único (`premium capabilities`).
- Reforçar tela Premium com comparativo detalhado por benefício real.
- Padronizar cartões de bloqueio Premium com CTA consistente.
- Melhorar copy em pontos de bloqueio (mostrar “o que você ganha agora”).
- Criar checklist de qualidade visual para telas Premium.

### Fase 2 (curto prazo, 1-2 sprints)
- Motor de insights premium:
  - janelas de melhor foco por tipo de tarefa;
  - risco de procrastinação por horário;
  - sugestão automática de duração ótima da sessão.
- Planejamento premium:
  - sugestão de agenda diária por blocos;
  - redistribuição automática quando houver quebra de rotina.
- Relatório semanal premium:
  - resumo narrativo;
  - gargalos;
  - plano de ajuste.

### Fase 3 (médio prazo, 2-3 sprints)
- Biblioteca de templates de rotina premium.
- Metas inteligentes com previsão de conclusão.
- Experiência premium de personalização (temas animados, packs visuais, feedback háptico refinado).
- Sistema de “missões premium” orientadas a consistência.

## 5) Melhorias de UX e microinteração (prioridade Premium)

### Antes da sessão de foco
- cartão de intenção (“qual resultado mínimo dessa sessão?”).
- sugestão premium de duração com base em histórico.

### Durante a sessão
- feedback visual de estabilidade de foco (premium).
- reforços curtos contextuais (premium) sem poluir.

### Após a sessão
- resumo com nota de qualidade da sessão (premium).
- CTA de próxima melhor ação (premium).

### No progresso
- visual de evolução semanal com leitura “insight + ação”.
- transições suaves em ganho de XP, streak e conquistas.

## 6) Indicadores de sucesso

- conversão Free -> Premium;
- retenção D7 / D30;
- sessões por usuário ativo;
- taxa de conclusão de tarefas e hábitos;
- uso das funcionalidades premium de análise e coach;
- redução de interrupções por sessão após recomendações.

## 7) Backlog objetivo (próximas implementações)

1. Refatorar monetização para capacidades centralizadas.
2. Reescrever e elevar design da tela Premium (comparativo, destaque de valor, CTA forte).
3. Criar componente padrão `PremiumGateCard`.
4. Introduzir insights premium priorizados por impacto.
5. Implementar relatório semanal premium.
6. Adicionar exportação CSV premium.
7. Refinar microinterações premium em foco e progresso.

