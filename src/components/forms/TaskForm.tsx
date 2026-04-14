import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppInput } from "@/components/common/AppInput";
import { TaskInput } from "@/services/taskService";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";

interface Props {
  initial?: Partial<TaskInput>;
  categories?: { id: string; nome: string }[];
  goals?: { id: string; titulo: string }[];
  areas?: { id: string; nome: string }[];
  onSubmit: (input: TaskInput) => Promise<void>;
  submitLabel?: string;
}

export function TaskForm({
  initial,
  categories = [],
  goals = [],
  areas = [],
  onSubmit,
  submitLabel = "Salvar tarefa"
}: Props) {
  const { colors } = useTheme();
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");
  const [categoriaId, setCategoriaId] = useState(initial?.categoria_id ?? null);
  const [prioridade, setPrioridade] = useState(`${initial?.prioridade ?? 2}`);
  const [dataPrevista, setDataPrevista] = useState(initial?.data_prevista ?? "");
  const [horaPrevista, setHoraPrevista] = useState(initial?.hora_prevista ?? "");
  const [duracaoEstimada, setDuracaoEstimada] = useState(`${initial?.duracao_estimada_min ?? ""}`);
  const [metaId, setMetaId] = useState(initial?.meta_id ?? null);
  const [areaId, setAreaId] = useState(initial?.area_id ?? null);
  const [repetirRegra, setRepetirRegra] = useState(initial?.repetir_regra ?? "");
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");
  const [subtarefasInput, setSubtarefasInput] = useState((initial?.subtarefas ?? []).join("\n"));
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const parsedSubtasks = useMemo(
    () =>
      subtarefasInput
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    [subtarefasInput]
  );

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [tagsInput]
  );

  const submit = async () => {
    if (!titulo.trim()) {
      setError("Título é obrigatório.");
      return;
    }
    setError("");
    setIsSaving(true);
    await onSubmit({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      categoria_id: categoriaId,
      prioridade: Number(prioridade) || 2,
      data_prevista: dataPrevista || null,
      hora_prevista: horaPrevista || null,
      duracao_estimada_min: Number(duracaoEstimada) || null,
      meta_id: metaId,
      area_id: areaId,
      repetir_regra: repetirRegra || null,
      observacoes: observacoes || null,
      subtarefas: parsedSubtasks,
      tags: parsedTags
    });
    setIsSaving(false);
  };

  return (
    <View style={styles.container}>
      <AppInput label="Título" value={titulo} onChangeText={setTitulo} placeholder="Ex.: Revisar capítulo 3" error={error} />
      <AppInput label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Detalhes opcionais" multiline />

      <Text style={[styles.label, { color: colors.mutedText }]}>Prioridade</Text>
      <View style={styles.inline}>
        {[
          { label: "Baixa", value: "1" },
          { label: "Média", value: "2" },
          { label: "Alta", value: "3" }
        ].map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setPrioridade(item.value)}
            style={[
              styles.pill,
              {
                borderColor: prioridade === item.value ? colors.primary : colors.border,
                backgroundColor: prioridade === item.value ? colors.primarySoft : colors.card
              }
            ]}
          >
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "700" }}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <AppInput label="Data (YYYY-MM-DD)" value={dataPrevista} onChangeText={setDataPrevista} placeholder="2026-04-10" />
      <AppInput label="Hora opcional (HH:mm)" value={horaPrevista} onChangeText={setHoraPrevista} placeholder="09:30" />
      <AppInput
        label="Duração estimada (min)"
        value={duracaoEstimada}
        onChangeText={setDuracaoEstimada}
        keyboardType="numeric"
        placeholder="45"
      />

      <Text style={[styles.label, { color: colors.mutedText }]}>Categoria</Text>
      <View style={styles.inlineWrap}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setCategoriaId(category.id)}
            style={[
              styles.pill,
              {
                borderColor: categoriaId === category.id ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>{category.nome}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.mutedText }]}>Meta vinculada</Text>
      <View style={styles.inlineWrap}>
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            onPress={() => setMetaId(goal.id)}
            style={[styles.pill, { borderColor: metaId === goal.id ? colors.primary : colors.border }]}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>{goal.titulo}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.mutedText }]}>Área da vida</Text>
      <View style={styles.inlineWrap}>
        {areas.map((area) => (
          <Pressable
            key={area.id}
            onPress={() => setAreaId(area.id)}
            style={[styles.pill, { borderColor: areaId === area.id ? colors.primary : colors.border }]}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>{area.nome}</Text>
          </Pressable>
        ))}
      </View>

      <AppInput label="Repetição (opcional)" value={repetirRegra} onChangeText={setRepetirRegra} placeholder="Ex.: semanal" />
      <AppInput
        label="Subtarefas (uma por linha)"
        value={subtarefasInput}
        onChangeText={setSubtarefasInput}
        multiline
        placeholder={"Planejar\nExecutar\nRevisar"}
      />
      <AppInput label="Tags (separadas por vírgula)" value={tagsInput} onChangeText={setTagsInput} placeholder="prova, leitura" />
      <AppInput label="Observações" value={observacoes} onChangeText={setObservacoes} multiline />

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
    minHeight: 32,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center"
  }
});
