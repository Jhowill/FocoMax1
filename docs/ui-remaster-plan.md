# Plano de Remasterizacao UI - FocoMax

## Fontes usadas
- `C:/Users/Usuário/Desktop/Contexto decisao UI.txt`
- `C:/Users/Usuário/Desktop/Desing engine.txt`
- `C:/Users/Usuário/Desktop/desing system.txt`
- `C:/Users/Usuário/Desktop/Aquitetura de pagina.txt` (arquivo vazio)

## Decisoes de design aplicadas
- Contexto visual adotado: `Produtividade friendly` com acabamento premium.
- Cor principal: aqua/teal.
- Cor secundaria: teal dessaturado para suporte, sem competir com CTA.
- Cor de destaque: coral/amber em baixa frequencia.
- Variantes:
  - Primario: filled
  - Secundario: outline
  - Terciario: ghost
  - Destrutivo: filled vermelho
- Densidade: comfortable.
- Radius padrao: arredondado amigavel para navegacao mobile.
- Elevacao: media, com sombra suave e consistente.
- Tipografia: limpa, legivel e amigavel, com hierarquia curta por tela.

## Mudancas executadas
- Tokens globais refeitos em `src/theme/colors.ts`, `src/theme/spacing.ts`, `src/theme/typography.ts`.
- Novo sistema de forma/elevacao em `src/theme/shape.ts`.
- `ThemeProvider` expandido com `visualPack` (default, aurora, sunrise).
- Componentes base refeitos:
  - `AppButton`, `AppCard`, `AppInput`, `Segmented`, `StateViews`, `ScreenContainer`, `PageHeader`, `LuxuryGradientBackground`, `AdBanner`, `PremiumGateCard`.
- Navegacao remasterizada:
  - `HomeTabsNavigator` e `RootNavigator`.
- Telas Home refeitas:
  - `TodayScreen`, `FocusHomeScreen`, `PlanningHomeScreen`, `ProgressHomeScreen`, `ProfileHomeScreen`.
- Premium reforcado:
  - `PremiumScreen`, `SettingsPremiumScreen`, `SettingsAppearanceScreen`.
- Fluxo de foco ajustado visualmente:
  - `FocusSessionScreen`, `FocusHistoryScreen`.
- Onboarding atualizado:
  - `OnboardingLayout`, `WelcomeScreen`, `ThemeScreen`.

## Proximas iteracoes recomendadas
- Normalizar textos com acentuacao em arquivos antigos que ainda estao com codificacao inconsistente.
- Aplicar a mesma lapidacao visual nas demais telas secundarias (metas, habitos, tarefas, progresso detalhado).
- Incluir testes de snapshot visual e checklist de contraste por tela.
