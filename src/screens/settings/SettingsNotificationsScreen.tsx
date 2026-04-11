import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import {
  requestNotificationPermission,
  scheduleFocusReminder,
  scheduleHabitReminder
} from "@/services/notificationService";
import { getAppSettings, updateAppSettings } from "@/services/userService";
import { useTheme } from "@/theme/ThemeProvider";

export function SettingsNotificationsScreen() {
  const { colors } = useTheme();
  const [focusReminder, setFocusReminder] = useState(true);
  const [habitReminder, setHabitReminder] = useState(true);
  const [taskReminder, setTaskReminder] = useState(true);
  const [daySummary, setDaySummary] = useState(true);
  const [weekSummary, setWeekSummary] = useState(true);

  useEffect(() => {
    getAppSettings().then((settings) => {
      setFocusReminder(Boolean(settings?.lembrete_foco ?? 1));
      setHabitReminder(Boolean(settings?.lembrete_habito ?? 1));
      setTaskReminder(Boolean(settings?.lembrete_tarefa ?? 1));
      setDaySummary(Boolean(settings?.resumo_dia ?? 1));
      setWeekSummary(Boolean(settings?.resumo_semana ?? 1));
    });
  }, []);

  const save = async () => {
    await updateAppSettings({
      lembrete_foco: focusReminder ? 1 : 0,
      lembrete_habito: habitReminder ? 1 : 0,
      lembrete_tarefa: taskReminder ? 1 : 0,
      resumo_dia: daySummary ? 1 : 0,
      resumo_semana: weekSummary ? 1 : 0
    });
  };

  const askPermission = async () => {
    const granted = await requestNotificationPermission();
    Alert.alert("Notificações", granted ? "Permissão concedida." : "Permissão negada.");
  };

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
        {[
          { label: "Lembrete de foco", value: focusReminder, setter: setFocusReminder },
          { label: "Lembrete de hábito", value: habitReminder, setter: setHabitReminder },
          { label: "Lembrete de tarefa", value: taskReminder, setter: setTaskReminder },
          { label: "Resumo do dia", value: daySummary, setter: setDaySummary },
          { label: "Resumo da semana", value: weekSummary, setter: setWeekSummary }
        ].map((item) => (
          <Pressable
            key={item.label}
            onPress={() => item.setter((prev: boolean) => !prev)}
            style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Text style={{ color: colors.text }}>
              {item.label}: {item.value ? "Ativo" : "Inativo"}
            </Text>
          </Pressable>
        ))}
        <AppButton title="Salvar notificações" onPress={save} />
        <AppButton title="Permitir notificações" onPress={askPermission} variant="secondary" />
        <AppButton
          title="Testar lembrete de foco (1 min)"
          onPress={async () => {
            await scheduleFocusReminder(1);
            Alert.alert("Agendado", "Lembrete de foco em 1 minuto.");
          }}
          variant="secondary"
        />
        <AppButton
          title="Testar lembrete de hábito (1 min)"
          onPress={async () => {
            await scheduleHabitReminder("Executar hábito do dia", 1);
            Alert.alert("Agendado", "Lembrete de hábito em 1 minuto.");
          }}
          variant="secondary"
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
  toggle: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 12
  }
});
