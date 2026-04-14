import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const checks = [
  {
    name: "Onboarding completo nas rotas tipadas",
    file: "src/navigation/types.ts",
    includes: ["OnboardingWelcome", "OnboardingGoal", "OnboardingDifficulty", "OnboardingTarget", "OnboardingTheme", "OnboardingMode", "OnboardingFinish"]
  },
  {
    name: "Fluxo foco e backup no deep linking",
    file: "src/navigation/expoAdapter.ts",
    includes: ["/focus/session", "/focus/history", "/backup/export", "/backup/import"]
  },
  {
    name: "Sessao de foco com resumo e historico",
    file: "src/screens/focus/FocusSessionScreen.tsx",
    includes: ["FocusSummary", "FocusHistory", "registerInterruption", "registerPause"]
  },
  {
    name: "Backup automatico local implementado",
    file: "src/services/backupService.ts",
    includes: ["runAutoBackupIfNeeded", "exportBackupLocally", "registerBackupMetadata"]
  },
  {
    name: "Plano premium detalhado",
    file: "src/screens/premium/PremiumScreen.tsx",
    includes: ["Plano semanal premium", "Tendencia de longo prazo", "Exportar relatorio premium CSV"]
  }
];

let failed = 0;

for (const check of checks) {
  const content = read(check.file);
  const missing = check.includes.filter((snippet) => !content.includes(snippet));
  if (missing.length > 0) {
    failed += 1;
    console.error(`FAIL: ${check.name}`);
    for (const item of missing) {
      console.error(`  - trecho ausente: "${item}"`);
    }
  } else {
    console.log(`OK: ${check.name}`);
  }
}

if (failed > 0) {
  console.error(`\nFalhas encontradas: ${failed}`);
  process.exit(1);
}

console.log("\nFluxos criticos validados.");
