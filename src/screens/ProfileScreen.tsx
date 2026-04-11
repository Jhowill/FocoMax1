import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppInput } from "@/components/common/AppInput";
import { getLocalUser, updateLocalUser } from "@/services/userService";
import { useTheme } from "@/theme/ThemeProvider";

export function ProfileScreen() {
  const { colors } = useTheme();
  const [nome, setNome] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [modo, setModo] = useState("");

  useEffect(() => {
    getLocalUser().then((user) => {
      setNome(user?.nome ?? "");
      setObjetivo(user?.objetivo_principal ?? "");
      setModo(user?.modo_uso ?? "");
    });
  }, []);

  return (
    <View style={styles.container}>
      <AppCard>
        <Text style={[styles.title, { color: colors.text }]}>Conta local</Text>
        <AppInput label="Nome" value={nome} onChangeText={setNome} />
        <AppInput label="Objetivo principal" value={objetivo} onChangeText={setObjetivo} />
        <AppInput label="Modo de uso" value={modo} onChangeText={setModo} />
        <AppButton
          title="Salvar perfil local"
          onPress={async () => {
            await updateLocalUser({
              nome,
              objetivo_principal: objetivo,
              modo_uso: modo
            });
          }}
        />
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
  }
});
