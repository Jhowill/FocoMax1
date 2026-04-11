import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
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
  };

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Configurações de foco</Text>
        <AppInput label="Duração padrão (min)" value={duracaoPadrao} onChangeText={setDuracaoPadrao} keyboardType="numeric" />
        <AppInput label="Pausa curta (min)" value={pausaCurta} onChangeText={setPausaCurta} keyboardType="numeric" />
        <AppInput label="Pausa longa (min)" value={pausaLonga} onChangeText={setPausaLonga} keyboardType="numeric" />
        <AppInput label="Número de ciclos" value={ciclos} onChangeText={setCiclos} keyboardType="numeric" />
        <AppInput label="Foco livre padrão (min)" value={focoLivre} onChangeText={setFocoLivre} keyboardType="numeric" />
        <AppInput label="Som" value={som} onChangeText={setSom} />

        <Pressable onPress={() => setVibracao((prev) => !prev)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Vibração: {vibracao ? "Ativa" : "Inativa"}</Text>
        </Pressable>
        <Pressable onPress={() => setAutoPausa((prev) => !prev)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Início automático da pausa: {autoPausa ? "Ativo" : "Inativo"}</Text>
        </Pressable>
        <Pressable onPress={() => setAutoProxima((prev) => !prev)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Próxima sessão automática: {autoProxima ? "Ativa" : "Inativa"}</Text>
        </Pressable>

        <AppButton title="Salvar foco" onPress={save} />
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
