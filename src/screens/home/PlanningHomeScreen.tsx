import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AdBanner } from "@/components/common/AdBanner";
import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getFirst } from "@/db/database";
import { useRootNavigation } from "@/navigation/hooks";
import { createAreaLife, createCategory, listAreasLife, listCategories } from "@/services/catalogService";
import { getPlanningAssistant, replanOverdueTasks } from "@/services/taskService";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/typography";

export function PlanningHomeScreen() {
  const { colors } = useTheme();
  const navigation = useRootNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({
    tarefas: 0,
    metas: 0,
    habitos: 0,
    areas: 0,
    categorias: 0
  });
  const [areas, setAreas] = useState<{ id: string; nome: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; nome: string }[]>([]);
  const [assistant, setAssistant] = useState<Awaited<ReturnType<typeof getPlanningAssistant>>>();
  const [newArea, setNewArea] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [tarefas, metas, habitos, areasCount, categoriasCount, areaRows, categoryRows, assistantData] = await Promise.all([
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM tarefas WHERE is_archived = 0"),
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM metas WHERE is_archived = 0"),
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM habitos WHERE is_archived = 0"),
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM areas_vida WHERE is_archived = 0"),
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM categorias"),
        listAreasLife(),
        listCategories(),
        getPlanningAssistant()
      ]);
      setCounts({
        tarefas: tarefas?.total ?? 0,
        metas: metas?.total ?? 0,
        habitos: habitos?.total ?? 0,
        areas: areasCount?.total ?? 0,
        categorias: categoriasCount?.total ?? 0
      });
      setAreas(areaRows);
      setCategories(categoryRows);
      setAssistant(assistantData);
      setError("");
    } catch {
      setError("Nao foi possivel carregar seu planejamento.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return <LoadingState message="Carregando planejamento..." />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <AppCard tone="premium">
        <Text style={[styles.title, { color: colors.text }]}>Planejamento diario</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Organize tarefas, metas e habitos com filtros, historico e edicao total.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Visao rapida</Text>
        <Text style={[styles.body, { color: colors.text }]}>Tarefas ativas: {counts.tarefas}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Metas: {counts.metas}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Habitos: {counts.habitos}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Areas da vida: {counts.areas}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Categorias: {counts.categorias}</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Acessos</Text>
        <View style={styles.actions}>
          <AppButton title="Tarefas" onPress={() => navigation.navigate("Tasks")} />
          <AppButton title="Metas" onPress={() => navigation.navigate("Goals")} variant="secondary" />
          <AppButton title="Habitos" onPress={() => navigation.navigate("Habits")} variant="secondary" />
        </View>
      </AppCard>

      {assistant ? (
        <AppCard tone="soft">
          <Text style={[styles.title, { color: colors.text }]}>Priorizador automatico</Text>
          <Text style={[styles.caption, { color: colors.mutedText }]}>
            Janela recomendada para tarefas exigentes: {assistant.suggestedWindow}
          </Text>
          <Text style={[styles.caption, { color: colors.text }]}>{assistant.energyGuidance}</Text>
          {assistant.criticalTasks.length === 0 ? (
            <Text style={[styles.caption, { color: colors.mutedText }]}>Sem tarefas criticas no momento.</Text>
          ) : (
            assistant.criticalTasks.map((task) => (
              <Text key={task.id} style={[styles.caption, { color: colors.text }]}>
                - {task.titulo} (criticidade {task.criticidade})
              </Text>
            ))
          )}
          {assistant.overdueCount > 0 ? (
            <AppButton
              title={`Reagendar ${Math.min(assistant.overdueCount, 3)} atrasada(s)`}
              onPress={async () => {
                const result = await replanOverdueTasks(1, 3);
                Alert.alert("Reagendamento aplicado", `${result.moved} tarefa(s) movidas para ${result.targetDate}.`);
                await load();
              }}
              variant="secondary"
            />
          ) : null}
        </AppCard>
      ) : null}

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Areas da vida</Text>
        <AppInput label="Nova area" value={newArea} onChangeText={setNewArea} placeholder="Ex.: Saude" />
        <AppButton
          title="Adicionar area"
          onPress={async () => {
            if (!newArea.trim()) {
              return;
            }
            await createAreaLife(newArea.trim());
            setNewArea("");
            await load();
          }}
          variant="secondary"
        />
        {areas.map((area) => (
          <Text key={area.id} style={[styles.caption, { color: colors.text }]}>
            - {area.nome}
          </Text>
        ))}
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Categorias</Text>
        <AppInput label="Nova categoria" value={newCategory} onChangeText={setNewCategory} placeholder="Ex.: Estudos" />
        <AppButton
          title="Adicionar categoria de tarefa"
          onPress={async () => {
            if (!newCategory.trim()) {
              return;
            }
            await createCategory(newCategory.trim(), "tarefa");
            setNewCategory("");
            await load();
          }}
          variant="secondary"
        />
        {categories.slice(0, 8).map((category) => (
          <Text key={category.id} style={[styles.caption, { color: colors.text }]}>
            - {category.nome}
          </Text>
        ))}
      </AppCard>

      <AdBanner placement="planning" onUpgrade={load} />
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
    ...typography.h4
  },
  body: {
    ...typography.body
  },
  caption: {
    ...typography.small
  },
  actions: {
    gap: 10
  }
});
