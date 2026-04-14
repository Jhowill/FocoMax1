import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { getBoolPref, setBoolPref } from "@/services/localPrefsService";
import { listSystemShortcuts, openPlatformFocusSettings, openShortcut } from "@/services/systemIntegrationService";
import { getAppSettings, updateAppSettings } from "@/services/userService";
import { useTheme } from "@/theme/ThemeProvider";

export function SettingsFocusScreen() {
  const { colors } = useTheme();
  const [duracaoPadrao, setDuracaoPadrao] = useState("25");
  const [pausaCurta, setPausaCurta] = useState("5");
  const [pausaLonga, setPausaLonga] = useState("15");
  const [ciclos, setCiclos] = useState("4");
  const [focoLivre, setFocoLivre] = useState("45");
  const [som, setSom] = useState("campainha_1");
  const [vibracao, setVibracao] = useState(true);
  const [autoPausa, setAutoPausa] = useState(false);
  const [autoProxima, setAutoProxima] = useState(false);
  const [focusShield, setFocusShield] = useState(false);
  const [iosHint, setIosHint] = useState(true);
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  useEffect(() => {
    getAppSettings().then((settings) => {
      setDuracaoPadrao(`${settings?.duracao_foco_padrao_min ?? 25}`);
      setPausaCurta(`${settings?.pausa_curta_min ?? 5}`);
      setPausaLonga(`${settings?.pausa_longa_min ?? 15}`);
      setCiclos(`${settings?.ciclos_pomodoro ?? 4}`);
      setFocoLivre(`${settings?.foco_livre_padrao_min ?? 45}`);
      setSom((settings?.som_selecionado as string) ?? "campainha_1");
      setVibracao(Boolean(settings?.vibracao_ativa ?? 1));
      setAutoPausa(Boolean(settings?.pausa_auto_inicio ?? 0));
      setAutoProxima(Boolean(settings?.proxima_sessao_auto_inicio ?? 0));
    });
    getBoolPref("focus_shield_enabled").then(setFocusShield);
    getBoolPref("ios_focus_hint_enabled").then(setIosHint);
    getBoolPref("shortcuts_enabled").then(setShortcutsEnabled);
  }, []);

  const save = async () => {
    await updateAppSettings({
      duracao_foco_padrao_min: Number(duracaoPadrao) || 25,
      pausa_curta_min: Number(pausaCurta) || 5,
      pausa_longa_min: Number(pausaLonga) || 15,
      ciclos_pomodoro: Number(ciclos) || 4,
      foco_livre_padrao_min: Number(focoLivre) || 45,
      som_selecionado: som,
      vibracao_ativa: vibracao ? 1 : 0,
      pausa_auto_inicio: autoPausa ? 1 : 0,
      proxima_sessao_auto_inicio: autoProxima ? 1 : 0
    });
    await setBoolPref("focus_shield_enabled", focusShield);
    await setBoolPref("ios_focus_hint_enabled", iosHint);
    await setBoolPref("shortcuts_enabled", shortcutsEnabled);
    Alert.alert("Configuracoes salvas", "Preferencias de foco atualizadas.");
  };

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Configuracoes de foco</Text>
        <AppInput label="Duracao padrao (min)" value={duracaoPadrao} onChangeText={setDuracaoPadrao} keyboardType="numeric" />
        <AppInput label="Pausa curta (min)" value={pausaCurta} onChangeText={setPausaCurta} keyboardType="numeric" />
        <AppInput label="Pausa longa (min)" value={pausaLonga} onChangeText={setPausaLonga} keyboardType="numeric" />
        <AppInput label="Numero de ciclos" value={ciclos} onChangeText={setCiclos} keyboardType="numeric" />
        <AppInput label="Foco livre padrao (min)" value={focoLivre} onChangeText={setFocoLivre} keyboardType="numeric" />
        <AppInput label="Som" value={som} onChangeText={setSom} />

        <Pressable onPress={() => setVibracao((prev) => !prev)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Vibracao: {vibracao ? "Ativa" : "Inativa"}</Text>
        </Pressable>
        <Pressable onPress={() => setAutoPausa((prev) => !prev)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Inicio automatico da pausa: {autoPausa ? "Ativo" : "Inativo"}</Text>
        </Pressable>
        <Pressable onPress={() => setAutoProxima((prev) => !prev)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Proxima sessao automatica: {autoProxima ? "Ativa" : "Inativa"}</Text>
        </Pressable>
        <Pressable onPress={() => setFocusShield((prev) => !prev)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Bloqueio anti-distracao (foco profundo): {focusShield ? "Ativo" : "Inativo"}</Text>
        </Pressable>
        <Pressable onPress={() => setIosHint((prev) => !prev)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Mostrar dica de modo Foco no iOS: {iosHint ? "Ativo" : "Inativo"}</Text>
        </Pressable>
        <Pressable onPress={() => setShortcutsEnabled((prev) => !prev)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Atalhos de sistema ativos: {shortcutsEnabled ? "Sim" : "Nao"}</Text>
        </Pressable>

        <AppButton title="Abrir ajustes do sistema" onPress={openPlatformFocusSettings} variant="secondary" />
        {Platform.OS === "android" && focusShield ? (
          <Text style={{ color: colors.mutedText, fontSize: 12 }}>
            No Android, ative permissao de uso/acessibilidade para reforcar o bloqueio anti-distracao.
          </Text>
        ) : null}

        <AppButton title="Salvar foco" onPress={save} />
      </AppCard>

      {shortcutsEnabled ? (
        <AppCard>
          <Text style={[styles.title, { color: colors.text, fontSize: 16 }]}>Atalhos rapidos</Text>
          <Text style={{ color: colors.mutedText, fontSize: 12 }}>
            Funciona como atalho de sistema por deep link para abrir direto no modo foco.
          </Text>
          {listSystemShortcuts().map((shortcut) => (
            <AppButton key={shortcut.id} title={shortcut.label} onPress={() => openShortcut(shortcut.url)} variant="ghost" />
          ))}
        </AppCard>
      ) : null}
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
