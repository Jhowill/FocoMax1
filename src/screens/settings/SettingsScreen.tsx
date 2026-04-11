import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { RootStackParamList } from "@/navigation/types";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Conta local, aparência, foco, notificações, dados e premium.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Seções</Text>
        <View style={styles.actions}>
          <AppButton title="Conta local" onPress={() => navigation.navigate("Profile")} />
          <AppButton title="Aparência" onPress={() => navigation.navigate("SettingsAppearance")} variant="secondary" />
          <AppButton title="Foco" onPress={() => navigation.navigate("SettingsFocus")} variant="secondary" />
          <AppButton title="Notificações" onPress={() => navigation.navigate("SettingsNotifications")} variant="secondary" />
          <AppButton title="Dados" onPress={() => navigation.navigate("SettingsData")} variant="secondary" />
          <AppButton title="Premium" onPress={() => navigation.navigate("SettingsPremium")} variant="secondary" />
          <AppButton title="Sobre" onPress={() => navigation.navigate("Premium")} variant="ghost" />
        </View>
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
  }
});
