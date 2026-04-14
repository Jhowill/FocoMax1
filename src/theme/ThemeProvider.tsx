import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";

import { getBoolPref, getStringPref, setBoolPref, setStringPref } from "@/services/localPrefsService";
import { PremiumVisualPack, resolveThemeColors, ThemeMode } from "@/theme/colors";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  colors: ReturnType<typeof resolveThemeColors>;
  isDark: boolean;
  visualPack: PremiumVisualPack;
  setVisualPack: (pack: PremiumVisualPack) => Promise<void>;
  largeTouchTargets: boolean;
  highContrast: boolean;
  setLargeTouchTargets: (value: boolean) => Promise<void>;
  setHighContrast: (value: boolean) => Promise<void>;
};

const STORAGE_KEY = "@focomax:theme-mode";

const ThemeContext = createContext<ThemeContextValue>({
  mode: "auto",
  setMode: async () => undefined,
  colors: resolveThemeColors(false, "default"),
  isDark: false,
  visualPack: "default",
  setVisualPack: async () => undefined,
  largeTouchTargets: true,
  highContrast: false,
  setLargeTouchTargets: async () => undefined,
  setHighContrast: async () => undefined
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
  const [visualPack, setVisualPackState] = useState<PremiumVisualPack>("default");
  const [largeTouchTargets, setLargeTouchTargetsState] = useState(true);
  const [highContrast, setHighContrastState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "dark" || saved === "light" || saved === "auto") {
        setModeState(saved);
      }
    });
    Promise.all([
      getBoolPref("large_touch_targets_enabled"),
      getBoolPref("high_contrast_enabled"),
      getStringPref("premium_visual_pack")
    ]).then(([largeTargets, contrast, savedPack]) => {
        setLargeTouchTargetsState(largeTargets);
        setHighContrastState(contrast);
        if (savedPack === "default" || savedPack === "aurora" || savedPack === "sunrise") {
          setVisualPackState(savedPack);
        }
      }
    );
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setScheme(colorScheme));
    return () => sub.remove();
  }, []);

  const setMode = async (value: ThemeMode) => {
    setModeState(value);
    await AsyncStorage.setItem(STORAGE_KEY, value);
  };

  const setLargeTouchTargets = async (value: boolean) => {
    setLargeTouchTargetsState(value);
    await setBoolPref("large_touch_targets_enabled", value);
  };

  const setHighContrast = async (value: boolean) => {
    setHighContrastState(value);
    await setBoolPref("high_contrast_enabled", value);
  };

  const setVisualPack = async (pack: PremiumVisualPack) => {
    setVisualPackState(pack);
    await setStringPref("premium_visual_pack", pack);
  };

  const value = useMemo(() => {
    const isDark = resolveIsDark(mode, scheme);
    const baseColors = resolveThemeColors(isDark, visualPack);
    const colors = highContrast
      ? {
          ...baseColors,
          border: isDark ? "#93B1FF" : "#244CAD",
          mutedText: isDark ? "#E8EFFF" : "#2A3F73",
          cardSecondary: isDark ? "#2A3A5D" : "#EAF1FF",
          focusRing: isDark ? "#C7D8FF" : "#3E66D6"
        }
      : baseColors;

    return {
      mode,
      setMode,
      colors,
      isDark,
      visualPack,
      setVisualPack,
      largeTouchTargets,
      highContrast,
      setLargeTouchTargets,
      setHighContrast
    };
  }, [mode, scheme, visualPack, largeTouchTargets, highContrast]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
