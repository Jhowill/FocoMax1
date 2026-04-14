import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { initDatabase } from "@/db/database";
import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { useRootNavigation } from "@/navigation/hooks";
import {
  exportBackupLocally,
  exportPremiumCsvReport,
  getLastBackupMetadata,
  importBackupFromFilePicker,
  runAutoBackupIfNeeded,
  wipeAllDataAndRecreate
} from "@/services/backupService";
import { getBoolPref, getStringPref, setBoolPref, setStringPref } from "@/services/localPrefsService";
import { getPremiumState } from "@/services/monetizationService";
import { getPremiumCapabilities } from "@/services/premiumCapabilities";
import { useAppContext } from "@/state/AppContext";
import { useTheme } from "@/theme/ThemeProvider";
import { confirmAction } from "@/utils/confirm";
import { formatPtDateTime } from "@/utils/date";

export function SettingsDataScreen() {
  const { colors } = useTheme();
  const navigation = useRootNavigation();
  const { refreshBootstrap } = useAppContext();
  const [lastBackup, setLastBackup] = useState<{ ultimo_backup_em?: string; caminho_arquivo?: string }>();
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupInterval, setAutoBackupInterval] = useState("24");
  const [premiumExportEnabled, setPremiumExportEnabled] = useState(false);

  const loadBackupInfo = async () => {
    const [info, autoEnabled, interval, premiumState] = await Promise.all([
      getLastBackupMetadata(),
      getBoolPref("auto_backup_enabled"),
      getStringPref("auto_backup_interval_hours"),
      getPremiumState()
    ]);
    const caps = getPremiumCapabilities(premiumState);
    setLastBackup(info ?? undefined);
    setAutoBackupEnabled(autoEnabled);
    setAutoBackupInterval(interval);
    setPremiumExportEnabled(caps.advanced_exports);
  };

  useEffect(() => {
    loadBackupInfo();
  }, []);

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Dados</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Exporte, importe e automatize backups locais com confirmacao clara.
        </Text>
        <Text style={{ color: colors.text, fontSize: 12 }}>
          Ultimo backup: {lastBackup?.ultimo_backup_em ? formatPtDateTime(lastBackup.ultimo_backup_em) : "ainda nao realizado"}
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Backup manual</Text>
        <View style={styles.actions}>
          <AppButton
            title="Exportar backup local"
            onPress={async () => {
              try {
                const path = await exportBackupLocally({ share: true, reason: "manual" });
                Alert.alert("Backup exportado", `Arquivo salvo em: ${path}`);
                await loadBackupInfo();
              } catch {
                Alert.alert("Falha no backup", "Nao foi possivel exportar o backup agora.");
              }
            }}
          />
          <AppButton
            title="Importar backup"
            onPress={async () => {
              try {
                const result = await importBackupFromFilePicker();
                if (result.imported) {
                  await refreshBootstrap();
                  Alert.alert("Importado", "Backup restaurado com sucesso.");
                } else {
                  Alert.alert("Importacao cancelada", result.reason);
                }
                await loadBackupInfo();
              } catch {
                Alert.alert("Falha na importacao", "Nao foi possivel importar o arquivo selecionado.");
              }
            }}
            variant="secondary"
          />
          <AppButton title="Tela exportacao detalhada" onPress={() => navigation.navigate("BackupExport")} variant="ghost" />
          <AppButton title="Tela importacao detalhada" onPress={() => navigation.navigate("BackupImport")} variant="ghost" />
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Backup automatico</Text>
        <Text style={{ color: colors.text, fontSize: 12 }}>
          Status: {autoBackupEnabled ? "Ativo" : "Desativado"} | Intervalo: {autoBackupInterval}h
        </Text>
        <View style={styles.actions}>
          <AppButton
            title={autoBackupEnabled ? "Desativar backup automatico" : "Ativar backup automatico"}
            onPress={async () => {
              await setBoolPref("auto_backup_enabled", !autoBackupEnabled);
              setAutoBackupEnabled((prev) => !prev);
            }}
            variant="secondary"
          />
          <View style={styles.row}>
            {["12", "24", "48"].map((hours) => (
              <AppButton
                key={hours}
                title={`${hours}h`}
                onPress={async () => {
                  await setStringPref("auto_backup_interval_hours", hours);
                  setAutoBackupInterval(hours);
                }}
                variant={autoBackupInterval === hours ? "primary" : "ghost"}
                style={styles.pillButton}
              />
            ))}
          </View>
          <AppButton
            title="Executar auto backup agora (teste)"
            onPress={async () => {
              const result = await runAutoBackupIfNeeded();
              if (result.executed) {
                Alert.alert("Auto backup executado", result.path ?? "Backup gerado.");
              } else {
                Alert.alert("Auto backup nao executado", `Motivo: ${result.reason}`);
              }
              await loadBackupInfo();
            }}
            variant="ghost"
          />
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Exportacao avancada</Text>
        {premiumExportEnabled ? (
          <AppButton
            title="Exportar relatorio premium CSV"
            onPress={async () => {
              try {
                const path = await exportPremiumCsvReport();
                Alert.alert("Relatorio exportado", `Arquivo CSV: ${path}`);
                await loadBackupInfo();
              } catch {
                Alert.alert("Falha na exportacao", "Nao foi possivel gerar o CSV premium.");
              }
            }}
            variant="secondary"
          />
        ) : (
          <AppButton title="Desbloquear exportacao premium" onPress={() => navigation.navigate("Premium")} variant="ghost" />
        )}
      </AppCard>

      <AppCard>
        <Text style={{ color: colors.danger, fontWeight: "800" }}>Zona critica</Text>
        <AppButton
          title="Redefinir app"
          onPress={() =>
            confirmAction(
              "Redefinir app",
              "Todos os dados locais serao removidos e o app sera reiniciado.",
              async () => {
                await wipeAllDataAndRecreate();
                await initDatabase(true);
                await refreshBootstrap();
                Alert.alert("App redefinido", "Os dados locais foram reinicializados.");
              },
              "Redefinir"
            )
          }
          variant="danger"
        />
        <AppButton
          title="Apagar dados (confirmacao forte)"
          onPress={() =>
            confirmAction(
              "Apagar todos os dados",
              "Essa acao remove definitivamente tarefas, sessoes, habitos e metas.",
              async () => {
                await wipeAllDataAndRecreate();
                await initDatabase(true);
                await refreshBootstrap();
                Alert.alert("Dados apagados", "Todos os dados locais foram removidos.");
              },
              "Apagar"
            )
          }
          variant="danger"
        />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12
  },
  title: {
    fontSize: 20,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "800"
  },
  actions: {
    gap: 8
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  pillButton: {
    flex: 1
  }
});
