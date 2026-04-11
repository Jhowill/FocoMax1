import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { RootStackParamList } from "@/navigation/types";
import { useAppContext } from "@/state/AppContext";
import { useTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { loading, onboardingDone, error, refreshBootstrap } = useAppContext();

  useEffect(() => {
    if (loading || error) {
      return;
    }

    const timeout = setTimeout(() => {
      if (onboardingDone) {
        navigation.replace("HomeTabs", { screen: "HomeToday" });
      } else {
        navigation.replace("OnboardingWelcome");
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [loading, onboardingDone, error, navigation]);

  if (!loading && error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.logo, { color: colors.primary }]}>FocoMax</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText, textAlign: "center" }]}>{error}</Text>
        <View style={styles.retry}>
          <AppButton title="Tentar novamente" onPress={refreshBootstrap} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logo, { color: colors.primary }]}>FocoMax</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>Seu sistema pessoal de foco e disciplina</Text>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  logo: {
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20
  },
  retry: {
    width: "70%"
  }
});
