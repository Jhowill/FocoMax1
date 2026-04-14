import "react-native-gesture-handler";

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

import { AppProvider } from "@/state/AppContext";
import { OnboardingProvider } from "@/state/OnboardingContext";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

function RouterStack() {
  const { colors, isDark } = useTheme();

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          primary: colors.primary
        }
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          primary: colors.primary
        }
      };

  return (
    <NavigationThemeProvider value={navTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surfaceElevated
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
            fontWeight: "700"
          },
          contentStyle: {
            backgroundColor: colors.background
          },
          headerShadowVisible: false
        }}
      />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <OnboardingProvider>
          <RouterStack />
        </OnboardingProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
