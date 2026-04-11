import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { RootStackParamList } from "@/navigation/types";
import { createGoal } from "@/services/goalService";
import { createHabit } from "@/services/habitService";
import { updateAppSettings, updateLocalUser } from "@/services/userService";
import { useAppContext } from "@/state/AppContext";
import { useOnboarding } from "@/state/OnboardingContext";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingFinish">;

export function FinishScreen({ navigation }: Props) {
  const { data, reset } = useOnboarding();
  const { colors, setMode } = useTheme();
  const { refreshBootstrap } = useAppContext();
  const [saving, setSaving] = useState(false);

  const waitWithTimeout = async <T,>(promise: Promise<T>, timeoutMs = 2000) => {
    await Promise.race([
      promise,
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), timeoutMs);
      })
    ]);
  };

  const finish = async () => {
    if (saving) {
      return;
    }

    let navigated = false;
    setSaving(true);
    try {
      // Passos essenciais para destravar a entrada no app.
      await updateLocalUser({
        objetivo_principal: data.objetivoPrincipal,
        nivel_dificuldade: data.nivelDificuldade,
        modo_uso: data.modoUso,
        onboarding_concluido: 1
      });
      await updateAppSettings({
        tema: data.tema,
        duracao_foco_padrao_min: Math.round(Math.min(Math.max(data.metaFocoDia / 2, 15), 60))
      });
      await setMode(data.tema);

      // Nao bloquear a entrada se algum seed inicial falhar.
      await Promise.allSettled([
        createGoal({
          titulo: data.objetivoPrincipal,
          descricao: "Meta principal criada no onboarding.",
          progresso_percentual: 0
        }),
        createHabit({
          nome: data.habitoPrincipal,
          frequencia: "diario",
          meta_semanal: 5,
          dificuldade: data.nivelDificuldade
        })
      ]);

      // Evita ficar preso no loading caso bootstrap demore.
      await waitWithTimeout(refreshBootstrap(), 1800);

      reset();
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeTabs", params: { screen: "HomeToday" } }]
      });
      navigated = true;
    } catch (error) {
      Alert.alert(
        "Entrada com dados parciais",
        "Algumas informacoes nao puderam ser salvas agora. Voce pode continuar e ajustar em Configuracoes."
      );
      reset();
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeTabs", params: { screen: "HomeToday" } }]
      });
      navigated = true;
    } finally {
      if (!navigated) {
        setSaving(false);
      }
    }
  };

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Tudo pronto</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Este e seu ponto de partida para foco e consistencia.
      </Text>

      <AppCard>
        <Text style={[styles.item, { color: colors.text }]}>Objetivo: {data.objetivoPrincipal}</Text>
        <Text style={[styles.item, { color: colors.text }]}>Dificuldade: {data.nivelDificuldade}</Text>
        <Text style={[styles.item, { color: colors.text }]}>Meta de foco diaria: {data.metaFocoDia} min</Text>
        <Text style={[styles.item, { color: colors.text }]}>Tarefas por dia: {data.metaTarefasDia}</Text>
        <Text style={[styles.item, { color: colors.text }]}>Habito principal: {data.habitoPrincipal}</Text>
        <Text style={[styles.item, { color: colors.text }]}>Tema: {data.tema}</Text>
        <Text style={[styles.item, { color: colors.text }]}>Modo: {data.modoUso}</Text>
      </AppCard>

      <View style={styles.actions}>
        <AppButton title={saving ? "Entrando..." : "Entrar no app"} onPress={finish} disabled={saving} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 14
  },
  item: {
    fontSize: 14
  },
  actions: {
    marginTop: "auto",
    marginBottom: 16
  }
});
