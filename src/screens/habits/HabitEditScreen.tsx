import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { LoadingState } from "@/components/common/StateViews";
import { HabitForm } from "@/components/forms/HabitForm";
import { RootStackParamList } from "@/navigation/types";
import { listCategories } from "@/services/catalogService";
import { getHabitById, updateHabit } from "@/services/habitService";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "HabitEdit">;

export function HabitEditScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<any>();
  const [categories, setCategories] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    Promise.all([getHabitById(id), listCategories("habito")])
      .then(([habit, categoryRows]) => {
        setInitial(habit);
        setCategories(categoryRows);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !initial) {
    return <LoadingState message="Carregando edição..." />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Editar hábito</Text>
        <HabitForm
          initial={initial}
          categories={categories}
          submitLabel="Salvar alterações"
          onSubmit={async (input) => {
            await updateHabit(id, input);
            Alert.alert("Atualizado", "Hábito atualizado com sucesso.");
            navigation.replace("HabitDetail", { id });
          }}
        />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: "800"
  }
});
