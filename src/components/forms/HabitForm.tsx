import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppInput } from "@/components/common/AppInput";
import { HabitInput } from "@/services/habitService";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";

interface Props {
  initial?: Partial<HabitInput>;
  categories?: Array<{ id: string; nome: string }>;
  onSubmit: (input: HabitInput) => Promise<void>;
  submitLabel?: string;
}

export function HabitForm({ initial, categories = [], onSubmit, submitLabel = "Salvar hábito" }: Props) {
  const { colors } = useTheme();
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");
  const [frequencia, setFrequencia] = useState(initial?.frequencia ?? "diário");
  const [melhorHorario, setMelhorHorario] = useState(initial?.melhor_horario ?? "");
  const [metaSemanal, setMetaSemanal] = useState(`${initial?.meta_semanal ?? 5}`);
  const [tipo, setTipo] = useState(initial?.tipo ?? "consistência");
  const [dificuldade, setDificuldade] = useState(initial?.dificuldade ?? "média");
  const [cor, setCor] = useState(initial?.cor ?? "#3B82F6");
  const [icone, setIcone] = useState(initial?.icone ?? "check");
  const [categoriaId, setCategoriaId] = useState(initial?.categoria_id ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!nome.trim()) {
      setError("Nome do hábito é obrigatório.");
      return;
    }
    setError("");
    setIsSaving(true);
    await onSubmit({
      nome: nome.trim(),
      descricao: descricao || undefined,
      frequencia,
      melhor_horario: melhorHorario || undefined,
      meta_semanal: Number(metaSemanal) || 1,
      tipo,
      dificuldade,
      cor,
      icone,
      categoria_id: categoriaId,
      lembrete_local: true
    });
    setIsSaving(false);
  };

  return (
    <View style={styles.container}>
      <AppInput label="Nome" value={nome} onChangeText={setNome} placeholder="Ex.: Estudar 1h" error={error} />
      <AppInput label="Descrição" value={descricao} onChangeText={setDescricao} multiline />

      <Text style={[styles.label, { color: colors.mutedText }]}>Frequência</Text>
      <View style={styles.inline}>
        {["diário", "semanal", "dias úteis"].map((item) => (
          <Pressable
            key={item}
            onPress={() => setFrequencia(item)}
            style={[
              styles.pill,
              {
                borderColor: frequencia === item ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <AppInput label="Melhor horário" value={melhorHorario} onChangeText={setMelhorHorario} placeholder="07:00" />
      <AppInput label="Meta semanal" value={metaSemanal} onChangeText={setMetaSemanal} keyboardType="numeric" />
      <AppInput label="Tipo" value={tipo} onChangeText={setTipo} placeholder="Ex.: saúde mental" />
      <AppInput label="Dificuldade" value={dificuldade} onChangeText={setDificuldade} placeholder="baixa, média ou alta" />
      <AppInput label="Cor (hex)" value={cor} onChangeText={setCor} placeholder="#3B82F6" />
      <AppInput label="Ícone" value={icone} onChangeText={setIcone} placeholder="check" />

      <Text style={[styles.label, { color: colors.mutedText }]}>Categoria</Text>
      <View style={styles.inlineWrap}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setCategoriaId(category.id)}
            style={[styles.pill, { borderColor: categoriaId === category.id ? colors.primary : colors.border }]}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>{category.nome}</Text>
          </Pressable>
        ))}
      </View>

      <AppButton title={isSaving ? "Salvando..." : submitLabel} onPress={submit} disabled={isSaving} />
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
  inline: {
    flexDirection: "row",
    gap: spacing.xs
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
