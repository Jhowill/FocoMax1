import "react-native-gesture-handler";

import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import React from "react";
import { StatusBar } from "expo-status-bar";

import { RootNavigator } from "@/navigation/RootNavigator";
import { OnboardingProvider } from "@/state/OnboardingContext";
import { AppProvider } from "@/state/AppContext";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

function AppNavigation() {
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
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <OnboardingProvider>
          <AppNavigation />
        </OnboardingProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
