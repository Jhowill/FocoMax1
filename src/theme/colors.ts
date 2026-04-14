export type ThemeMode = "light" | "dark" | "auto";
export type PremiumVisualPack = "default" | "aurora" | "sunrise";

export const palette = {
  sky700: "#3E6BEB",
  sky600: "#4D7BFF",
  sky500: "#6A93FF",
  sky100: "#E8F0FF",
  teal600: "#24B79C",
  teal500: "#39C7AE",
  amber500: "#E9A23B",
  amber300: "#F6CD8D",
  neutral950: "#0B1020",
  neutral900: "#131A2B",
  neutral850: "#1A2237",
  neutral800: "#1F2940",
  neutral700: "#2D3A58",
  neutral600: "#5B657A",
  neutral500: "#8A94AB",
  neutral300: "#D7DEEA",
  neutral200: "#E4E9F5",
  neutral100: "#F5F8FF",
  white: "#FFFFFF",
  success500: "#2FB37F",
  warning500: "#E9A23B",
  danger500: "#DF6676",
  info500: "#4D7BFF"
};

const lightThemeBase = {
  background: palette.white,
  card: palette.white,
  cardSecondary: palette.neutral100,
  surfaceElevated: palette.white,
  inputBackground: "#F8FAFF",
  primary: palette.sky600,
  primarySoft: palette.sky100,
  secondary: "#5D6F92",
  accent: palette.teal600,
  text: "#101828",
  mutedText: palette.neutral600,
  border: palette.neutral200,
  success: palette.success500,
  warning: palette.warning500,
  danger: palette.danger500,
  info: palette.info500,
  badge: "#EEF3FF",
  shadow: "#0E1628",
  overlay: "rgba(15, 23, 42, 0.12)",
  focusRing: "#8EAFFF",
  textOnPrimary: "#FFFFFF",
  gradientTop: "#FFFFFF",
  gradientMid: "#FCFDFF",
  gradientBottom: "#F6F9FF",
  premiumHighlight: "#DDE8FF"
};

const darkThemeBase = {
  background: palette.neutral950,
  card: palette.neutral900,
  cardSecondary: palette.neutral850,
  surfaceElevated: palette.neutral850,
  inputBackground: palette.neutral800,
  primary: "#7FA4FF",
  primarySoft: "#263555",
  secondary: "#A7B6D8",
  accent: "#5ED6BE",
  text: "#EEF3FF",
  mutedText: "#B5C0D8",
  border: "#2D3957",
  success: "#4BC997",
  warning: "#F2BF67",
  danger: "#FF8E9D",
  info: "#8AAFFF",
  badge: "#243352",
  shadow: "#02050C",
  overlay: "rgba(1, 4, 12, 0.62)",
  focusRing: "#B1C9FF",
  textOnPrimary: "#0C1324",
  gradientTop: "#11182A",
  gradientMid: palette.neutral950,
  gradientBottom: "#080D1A",
  premiumHighlight: "#2A3C66"
};

const visualPackOverrides: Record<
  PremiumVisualPack,
  {
    light: Partial<typeof lightThemeBase>;
    dark: Partial<typeof darkThemeBase>;
  }
> = {
  default: {
    light: {},
    dark: {}
  },
  aurora: {
    light: {
      primary: "#3F8CFF",
      accent: "#33BFD8",
      gradientTop: "#FFFFFF",
      gradientMid: "#F7FBFF",
      gradientBottom: "#EDF5FF"
    },
    dark: {
      primary: "#82BEFF",
      accent: "#5BD8E9",
      gradientTop: "#122137",
      gradientMid: "#0D1424",
      gradientBottom: "#090F1C"
    }
  },
  sunrise: {
    light: {
      primary: "#3C7EFA",
      accent: "#F2AE63",
      gradientTop: "#FFFFFF",
      gradientMid: "#FFF9F2",
      gradientBottom: "#FFF1E1"
    },
    dark: {
      primary: "#92B9FF",
      accent: "#F7C68F",
      gradientTop: "#281E1B",
      gradientMid: "#121722",
      gradientBottom: "#0D111B"
    }
  }
};

export function resolveThemeColors(isDark: boolean, visualPack: PremiumVisualPack = "default") {
  const base = isDark ? darkThemeBase : lightThemeBase;
  const overrides = isDark ? visualPackOverrides[visualPack].dark : visualPackOverrides[visualPack].light;
  return {
    ...base,
    ...overrides
  };
}

export const lightTheme = resolveThemeColors(false, "default");
export const darkTheme = resolveThemeColors(true, "default");
