import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";

import { darkTheme, lightTheme, ThemeMode } from "@/theme/colors";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  colors: typeof lightTheme;
  isDark: boolean;
};

const STORAGE_KEY = "@focomax:theme-mode";

const ThemeContext = createContext<ThemeContextValue>({
  mode: "auto",
  setMode: async () => undefined,
  colors: lightTheme,
  isDark: false
});

const resolveIsDark = (mode: ThemeMode, scheme: ColorSchemeName) => {
  if (mode === "dark") {
    return true;
  }
  if (mode === "light") {
    return false;
  }
  return scheme === "dark";
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [scheme, setScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "dark" || saved === "light" || saved === "auto") {
        setModeState(saved);
      }
    });
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setScheme(colorScheme));
    return () => sub.remove();
  }, []);

  const setMode = async (value: ThemeMode) => {
    setModeState(value);
    await AsyncStorage.setItem(STORAGE_KEY, value);
  };

  const value = useMemo(() => {
    const isDark = resolveIsDark(mode, scheme);
    return {
      mode,
      setMode,
      colors: isDark ? darkTheme : lightTheme,
      isDark
    };
  }, [mode, scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
