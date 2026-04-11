export type ThemeMode = "light" | "dark" | "auto";

export const palette = {
  navy900: "#101B35",
  navy700: "#1F3264",
  sky600: "#2F6FED",
  sky500: "#4E88F1",
  sky200: "#C7D9FF",
  slate900: "#1A2540",
  slate700: "#364A72",
  slate600: "#55627D",
  slate400: "#8E9AB4",
  slate300: "#BCC6DB",
  slate200: "#DCE3F3",
  slate100: "#EEF2FC",
  cream50: "#F7F9FF",
  white: "#FFFFFF",
  green500: "#2BAA7C",
  amber500: "#E6A53B",
  red500: "#D9534F",
  purple500: "#7D6BFA",
  teal500: "#2FA6A1"
};

export const lightTheme = {
  background: palette.cream50,
  card: palette.white,
  cardSecondary: "#F2F6FF",
  primary: palette.sky600,
  primarySoft: "#EAF1FF",
  text: palette.slate900,
  mutedText: palette.slate600,
  border: palette.slate200,
  success: palette.green500,
  warning: palette.amber500,
  danger: palette.red500,
  badge: "#EEF3FF"
};

export const darkTheme = {
  background: "#0B1020",
  card: "#121C34",
  cardSecondary: "#182441",
  primary: "#7DA8FF",
  primarySoft: "#21345E",
  text: "#F4F7FF",
  mutedText: "#A7B5D3",
  border: "#253661",
  success: "#56D2A5",
  warning: "#F1C06A",
  danger: "#F28686",
  badge: "#1A2A4D"
};
