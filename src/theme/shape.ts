import { ViewStyle } from "react-native";

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 26,
  pill: 999
} as const;

export const elevation: Record<"none" | "sm" | "md" | "lg", ViewStyle> = {
  none: {
    shadowOpacity: 0,
    elevation: 0
  },
  sm: {
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  md: {
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  lg: {
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6
  }
};

export const motion = {
  quick: 140,
  standard: 260,
  smooth: 320
} as const;
