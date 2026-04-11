import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { AdBanner } from "@/components/common/AdBanner";
import { ErrorState, LoadingState } from "@/components/common/StateViews";
import { getFirst } from "@/db/database";
import { useRootNavigation } from "@/navigation/hooks";
import { createAreaLife, createCategory, listAreasLife, listCategories } from "@/services/catalogService";
import { useTheme } from "@/theme/ThemeProvider";

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
  const [areas, setAreas] = useState<Array<{ id: string; nome: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; nome: string }>>([]);
  const [newArea, setNewArea] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [tarefas, metas, habitos, areasCount, categoriasCount, areaRows, categoryRows] = await Promise.all([
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM tarefas WHERE is_archived = 0"),
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM metas WHERE is_archived = 0"),
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM habitos WHERE is_archived = 0"),
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM areas_vida WHERE is_archived = 0"),
        getFirst<{ total: number }>("SELECT COUNT(*) as total FROM categorias"),
        listAreasLife(),
        listCategories()
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
      setError("");
    } catch (err) {
      setError("Não foi possível carregar seu planejamento.");
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
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Planejamento diário</Text>
        <Text style={{ color: colors.mutedText, fontSize: 13 }}>
          Organize tarefas, metas e hábitos com filtros, histórico e edição total.
        </Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Visão rápida</Text>
        <Text style={{ color: colors.text }}>Tarefas ativas: {counts.tarefas}</Text>
        <Text style={{ color: colors.text }}>Metas: {counts.metas}</Text>
        <Text style={{ color: colors.text }}>Hábitos: {counts.habitos}</Text>
        <Text style={{ color: colors.text }}>Áreas da vida: {counts.areas}</Text>
        <Text style={{ color: colors.text }}>Categorias: {counts.categorias}</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Acessos</Text>
        <View style={styles.actions}>
          <AppButton title="Tarefas" onPress={() => navigation.navigate("Tasks")} />
          <AppButton title="Metas" onPress={() => navigation.navigate("Goals")} variant="secondary" />
          <AppButton title="Hábitos" onPress={() => navigation.navigate("Habits")} variant="secondary" />
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Áreas da vida</Text>
        <AppInput label="Nova área" value={newArea} onChangeText={setNewArea} placeholder="Ex.: Saúde" />
        <AppButton
          title="Adicionar área"
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
          <Text key={area.id} style={{ color: colors.text, fontSize: 12 }}>
            • {area.nome}
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
          <Text key={category.id} style={{ color: colors.text, fontSize: 12 }}>
            • {category.nome}
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
    gap: 12,
    paddingBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: "800"
  },
  actions: {
    gap: 8
  }
});
