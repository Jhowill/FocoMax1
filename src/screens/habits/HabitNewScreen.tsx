import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { LoadingState } from "@/components/common/StateViews";
import { HabitForm } from "@/components/forms/HabitForm";
import { RootStackParamList } from "@/navigation/types";
import { listCategories } from "@/services/catalogService";
import { createHabit } from "@/services/habitService";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "HabitNew">;

export function HabitNewScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; nome: string }>>([]);

  useEffect(() => {
    listCategories("habito")
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Preparando hábito..." />;
  }

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Criar hábito</Text>
        <HabitForm
          categories={categories}
          onSubmit={async (input) => {
            const id = await createHabit(input);
            Alert.alert("Hábito criado", "Seu hábito foi salvo.");
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
