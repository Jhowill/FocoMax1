# FocoMax

Aplicativo mobile-first em React Native (Expo), offline-first com SQLite local, focado em:

planejar -> executar foco -> registrar progresso -> analisar desempenho -> ajustar rotina -> manter consistência

## Stack

- React Native + Expo
- React Navigation (stack + bottom tabs)
- SQLite local (`expo-sqlite`)
- Notificações locais (`expo-notifications`)
- Backup/import/export local (`expo-file-system`, `expo-document-picker`, `expo-sharing`)
- Estado local com Context API

## Funcionalidades principais implementadas

- Onboarding completo em 7 etapas
- 5 abas principais: Hoje, Foco, Planejamento, Progresso, Perfil
- CRUD completo de tarefas, hábitos e metas
- Sessões de foco com modos:
  - pomodoro clássico
  - pomodoro customizado
  - foco livre
  - foco em blocos
  - sessão rápida
- Registro de pausas, interrupções e motivos de distração
- Histórico e resumo de sessões
- Dashboard e análise diária/semanal/mensal
- Coach local baseado em regras, sem IA externa obrigatória
- Gamificação (XP, níveis, streaks, conquistas e recompensas)
- Plano gratuito + premium (simulação local), remoção de anúncios e restauração
- Backup export/import local
- Configurações detalhadas (aparência, foco, notificações, dados, premium)

## Rotas (deep linking)

Configuradas em `src/app/linking.ts`, incluindo:

- `/splash`
- `/onboarding/*`
- `/home/today`, `/home/focus`, `/home/planning`, `/home/progress`, `/home/profile`
- `/tasks/*`, `/habits/*`, `/goals/*`
- `/focus/session`, `/focus/history`, `/focus/session/summary`
- `/progress/*`
- `/coach`, `/gamification`, `/achievements`, `/rewards`
- `/profile`, `/settings/*`, `/premium`
- `/backup/export`, `/backup/import`

## Como rodar

1. Instale dependências:
   - `npm install` (ou `yarn`)
2. Inicie o app:
   - `npm run start`
3. Abra no Android/iOS via Expo.

## Observações

- O app funciona offline sem backend obrigatório.
- Toda persistência principal ocorre em SQLite local.
- O estado premium/anúncios é simulável localmente para desenvolvimento e testes.
- Plano de evolução (especialmente Premium): `docs/PLANO_EVOLUCAO_PREMIUM.md`.
