import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { initDatabase } from "@/db/database";
import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { useRootNavigation } from "@/navigation/hooks";
import { exportBackupLocally, getLastBackupMetadata, importBackupFromFilePicker, wipeAllDataAndRecreate } from "@/services/backupService";
import { useAppContext } from "@/state/AppContext";
import { useTheme } from "@/theme/ThemeProvider";
import { confirmAction } from "@/utils/confirm";
import { formatPtDateTime } from "@/utils/date";

export function SettingsDataScreen() {
  const { colors } = useTheme();
  const navigation = useRootNavigation();
  const { refreshBootstrap } = useAppContext();
  const [lastBackup, setLastBackup] = useState<{ ultimo_backup_em?: string; caminho_arquivo?: string }>();

  const loadBackupInfo = async () => {
    const info = await getLastBackupMetadata();
    setLastBackup(info ?? undefined);
  };

  useEffect(() => {
    loadBackupInfo();
  }, []);

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Dados</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Exporte, importe e redefina seu app com confirmacao clara.
        </Text>
        <Text style={{ color: colors.text, fontSize: 12 }}>
          Ultimo backup: {lastBackup?.ultimo_backup_em ? formatPtDateTime(lastBackup.ultimo_backup_em) : "ainda nao realizado"}
        </Text>
      </AppCard>

      <AppCard>
        <View style={styles.actions}>
          <AppButton
            title="Exportar backup local"
            onPress={async () => {
              try {
                const path = await exportBackupLocally();
                Alert.alert("Backup exportado", `Arquivo salvo em: ${path}`);
                await loadBackupInfo();
              } catch (error) {
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
              } catch (error) {
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
  actions: {
    gap: 8
  }
});
