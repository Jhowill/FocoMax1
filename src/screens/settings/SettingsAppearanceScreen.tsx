import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { getAppSettings, updateAppSettings } from "@/services/userService";
import { ThemeMode } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

export function SettingsAppearanceScreen() {
  const { colors, mode, setMode } = useTheme();
  const [fontSize, setFontSize] = useState("1");
  const [reduceAnimations, setReduceAnimations] = useState(false);

  useEffect(() => {
    getAppSettings().then((settings) => {
      setFontSize(`${settings?.tamanho_fonte ?? 1}`);
      setReduceAnimations(Boolean(settings?.reduzir_animacoes ?? 0));
    });
  }, []);

  const save = async () => {
    await updateAppSettings({
      tema: mode,
      tamanho_fonte: Number(fontSize) || 1,
      reduzir_animacoes: reduceAnimations ? 1 : 0
    });
  };

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Aparência</Text>
        <Text style={{ color: colors.mutedText }}>Tema, fonte e preferências visuais.</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Tema</Text>
        <View style={styles.inline}>
          {(["dark", "light", "auto"] as ThemeMode[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setMode(item)}
              style={[styles.pill, { borderColor: mode === item ? colors.primary : colors.border }]}
            >
              <Text style={{ color: colors.text }}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <AppInput label="Tamanho de fonte (0.9 - 1.4)" value={fontSize} onChangeText={setFontSize} keyboardType="decimal-pad" />
        <Pressable
          onPress={() => setReduceAnimations((prev) => !prev)}
          style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={{ color: colors.text }}>Reduzir animações: {reduceAnimations ? "Ativo" : "Desativado"}</Text>
        </Pressable>
        <AppButton title="Salvar aparência" onPress={save} />
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
  inline: {
    flexDirection: "row",
    gap: 8
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 34,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  toggle: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 42,
    paddingHorizontal: 12,
    justifyContent: "center"
  }
});
