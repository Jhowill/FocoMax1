import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { exportBackupLocally, getLastBackupMetadata } from "@/services/backupService";
import { useTheme } from "@/theme/ThemeProvider";
import { formatPtDateTime } from "@/utils/date";

export function BackupExportScreen() {
  const { colors } = useTheme();
  const [lastBackup, setLastBackup] = useState<{ ultimo_backup_em?: string; caminho_arquivo?: string }>();

  const load = async () => {
    const info = await getLastBackupMetadata();
    setLastBackup(info ?? undefined);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Exportar backup local</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Exporta tarefas, hábitos, metas, sessões e estatísticas em JSON legível.
        </Text>
        <Text style={{ color: colors.text, fontSize: 12 }}>
          Último backup: {lastBackup?.ultimo_backup_em ? formatPtDateTime(lastBackup.ultimo_backup_em) : "nenhum"}
        </Text>
      </AppCard>

      <AppCard>
        <AppButton
          title="Exportar agora"
          onPress={async () => {
            const path = await exportBackupLocally();
            Alert.alert("Backup exportado", path);
            await load();
          }}
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
  }
});
