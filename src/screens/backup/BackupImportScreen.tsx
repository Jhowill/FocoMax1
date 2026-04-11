import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { importBackupFromFilePicker } from "@/services/backupService";
import { useAppContext } from "@/state/AppContext";
import { useTheme } from "@/theme/ThemeProvider";

export function BackupImportScreen() {
  const { colors } = useTheme();
  const { refreshBootstrap } = useAppContext();

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Importar backup</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Escolha um arquivo JSON exportado pelo FocoMax para restaurar seus dados.
        </Text>
      </AppCard>

      <AppCard>
        <AppButton
          title="Selecionar arquivo e importar"
          onPress={async () => {
            const result = await importBackupFromFilePicker();
            if (result.imported) {
              await refreshBootstrap();
              Alert.alert("Backup restaurado", "Os dados foram importados com sucesso.");
            } else {
              Alert.alert("Importação não concluída", result.reason);
            }
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
