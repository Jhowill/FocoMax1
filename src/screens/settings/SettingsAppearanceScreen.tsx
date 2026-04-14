import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { getAppSettings, updateAppSettings } from "@/services/userService";
import { ThemeMode } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

const VISUAL_PACKS = [
  { id: "default", label: "Classico" },
  { id: "aurora", label: "Aurora" },
  { id: "sunrise", label: "Sunrise" }
] as const;

export function SettingsAppearanceScreen() {
  const {
    colors,
    mode,
    setMode,
    highContrast,
    setHighContrast,
    largeTouchTargets,
    setLargeTouchTargets,
    visualPack,
    setVisualPack
  } = useTheme();
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
    await setHighContrast(highContrast);
    await setLargeTouchTargets(largeTouchTargets);
  };

  return (
    <View style={styles.container}>
      <AppCard tone="premium">
        <Text style={[styles.title, { color: colors.text }]}>Aparencia</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>Tema, fonte, acessibilidade e acabamento visual.</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.subtitle, { color: colors.text }]}>Tema</Text>
        <View style={styles.inline}>
          {(["dark", "light", "auto"] as ThemeMode[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setMode(item)}
              style={[
                styles.pill,
                {
                  borderColor: mode === item ? colors.primary : colors.border,
                  backgroundColor: mode === item ? colors.primarySoft : colors.inputBackground
                }
              ]}
            >
              <Text style={[styles.caption, { color: colors.text }]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.subtitle, { color: colors.text }]}>Pacote visual</Text>
        <View style={styles.inline}>
          {VISUAL_PACKS.map((pack) => (
            <Pressable
              key={pack.id}
              onPress={() => setVisualPack(pack.id)}
              style={[
                styles.pill,
                {
                  borderColor: visualPack === pack.id ? colors.primary : colors.border,
                  backgroundColor: visualPack === pack.id ? colors.primarySoft : colors.inputBackground
                }
              ]}
            >
              <Text style={[styles.caption, { color: colors.text }]}>{pack.label}</Text>
            </Pressable>
          ))}
        </View>

        <AppInput label="Tamanho de fonte (0.9 - 1.4)" value={fontSize} onChangeText={setFontSize} keyboardType="decimal-pad" />
        <Pressable
          onPress={() => setReduceAnimations((prev) => !prev)}
          style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}
        >
          <Text style={[styles.caption, { color: colors.text }]}>Reduzir animacoes: {reduceAnimations ? "Ativo" : "Desativado"}</Text>
        </Pressable>
        <Pressable
          onPress={() => setHighContrast(!highContrast)}
          style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}
        >
          <Text style={[styles.caption, { color: colors.text }]}>Alto contraste: {highContrast ? "Ativo" : "Desativado"}</Text>
        </Pressable>
        <Pressable
          onPress={() => setLargeTouchTargets(!largeTouchTargets)}
          style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}
        >
          <Text style={[styles.caption, { color: colors.text }]}>Toques ampliados: {largeTouchTargets ? "Ativo" : "Desativado"}</Text>
        </Pressable>
        <AppButton title="Salvar aparencia" onPress={save} />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingBottom: 20
  },
  title: {
    ...typography.h2
  },
  subtitle: {
    ...typography.subtitle
  },
  body: {
    ...typography.body
  },
  caption: {
    ...typography.small
  },
  inline: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  pill: {
    borderWidth: 1.2,
    borderRadius: radius.md,
    minHeight: 38,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  toggle: {
    borderWidth: 1.2,
    borderRadius: radius.lg,
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: "center"
  }
});
