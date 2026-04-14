import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { useAppContext } from "@/state/AppContext";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/typography";

export default function SplashRoute() {
  const router = useRouter();
  const { colors } = useTheme();
  const { loading, onboardingDone, error, refreshBootstrap } = useAppContext();

  useEffect(() => {
    if (loading || error) {
      return;
    }

    const timeout = setTimeout(() => {
      if (onboardingDone) {
        router.replace("/(tabs)/today");
      } else {
        router.replace("/onboarding/welcome");
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [loading, onboardingDone, error, router]);

  if (!loading && error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.logo, { color: colors.primary }]}>FocoFlow</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText, textAlign: "center" }]}>{error}</Text>
        <View style={styles.retry}>
          <AppButton title="Tentar novamente" onPress={refreshBootstrap} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logo, { color: colors.primary }]}>FocoFlow</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>Organizacao visual + foco profundo + progresso real</Text>
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
    ...typography.h1
  },
  subtitle: {
    ...typography.body,
    marginBottom: 20
  },
  retry: {
    width: "72%"
  }
});
