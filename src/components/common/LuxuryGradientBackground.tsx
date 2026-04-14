import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Defs, Ellipse, LinearGradient, Rect, Stop } from "react-native-svg";

import { useTheme } from "@/theme/ThemeProvider";

export function LuxuryGradientBackground() {
  const { width, height } = useWindowDimensions();
  const { colors, isDark, visualPack } = useTheme();
  const glowOpacity = isDark ? 0.2 : 0.08;
  const accentGlow =
    visualPack === "aurora"
      ? `rgba(63, 140, 255, ${glowOpacity})`
      : visualPack === "sunrise"
        ? `rgba(242, 174, 99, ${glowOpacity})`
        : `rgba(77, 123, 255, ${glowOpacity})`;
  const packHueGlow =
    visualPack === "aurora"
      ? "rgba(126, 186, 255, 0.15)"
      : visualPack === "sunrise"
        ? "rgba(250, 205, 149, 0.13)"
        : "rgba(131, 165, 255, 0.12)";

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.gradientTop} />
            <Stop offset="55%" stopColor={colors.gradientMid} />
            <Stop offset="100%" stopColor={colors.gradientBottom} />
          </LinearGradient>
          <LinearGradient id="accentGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={accentGlow} />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#screenGradient)" />
        <Rect width={width} height={height} fill="url(#accentGradient)" />
        <Ellipse cx={width * 0.16} cy={height * 0.09} rx={width * 0.35} ry={height * 0.14} fill={packHueGlow} />
        <Ellipse
          cx={width * 0.88}
          cy={height * 0.82}
          rx={width * 0.36}
          ry={height * 0.2}
          fill={colors.premiumHighlight}
          opacity={isDark ? 0.1 : 0.14}
        />
      </Svg>
    </View>
  );
}
