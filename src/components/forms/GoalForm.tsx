import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppInput } from "@/components/common/AppInput";
import { GoalInput } from "@/services/goalService";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";

interface Props {
  initial?: Partial<GoalInput>;
  areas?: Array<{ id: string; nome: string }>;
  onSubmit: (input: GoalInput) => Promise<void>;
  submitLabel?: string;
}

export function GoalForm({ initial, areas = [], onSubmit, submitLabel = "Salvar meta" }: Props) {
  const { colors } = useTheme();
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");
  const [prazo, setPrazo] = useState(initial?.prazo ?? "");
  const [progresso, setProgresso] = useState(`${initial?.progresso_percentual ?? 0}`);
  const [areaId, setAreaId] = useState(initial?.area_id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!titulo.trim()) {
      setError("Título da meta é obrigatório.");
      return;
    }
    setError("");
    setSaving(true);
    await onSubmit({
      titulo: titulo.trim(),
      descricao: descricao || undefined,
      prazo: prazo || null,
      area_id: areaId,
      progresso_percentual: Math.max(0, Math.min(100, Number(progresso) || 0))
    });
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <AppInput label="Título" value={titulo} onChangeText={setTitulo} placeholder="Ex.: Aprovar em certificação" error={error} />
      <AppInput label="Descrição" value={descricao} onChangeText={setDescricao} multiline />
      <AppInput label="Prazo (YYYY-MM-DD)" value={prazo} onChangeText={setPrazo} placeholder="2026-06-30" />
      <AppInput label="Progresso inicial (%)" value={progresso} onChangeText={setProgresso} keyboardType="numeric" />

      <Text style={[styles.label, { color: colors.mutedText }]}>Área da vida</Text>
      <View style={styles.inlineWrap}>
        {areas.map((area) => (
          <Pressable
            key={area.id}
            onPress={() => setAreaId(area.id)}
            style={[
              styles.pill,
              {
                borderColor: areaId === area.id ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>{area.nome}</Text>
          </Pressable>
        ))}
      </View>

      <AppButton title={saving ? "Salvando..." : submitLabel} onPress={submit} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  label: {
    fontSize: 13,
    fontWeight: "600"
  },
  inlineWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center"
  }
});
