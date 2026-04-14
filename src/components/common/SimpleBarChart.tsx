import React from "react";
import { Dimensions, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

import { useTheme } from "@/theme/ThemeProvider";

function hexToRgba(hex: string, opacity = 1) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  const parsed = Number.parseInt(value, 16);
  if (Number.isNaN(parsed)) {
    return `rgba(0,0,0,${opacity})`;
  }
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function SimpleBarChart({
  labels,
  values
}: {
  labels: string[];
  values: number[];
}) {
  const { colors } = useTheme();
  const width = Dimensions.get("window").width - 52;
  const data = {
    labels: labels.length ? labels : ["-"],
    datasets: [{ data: values.length ? values : [0] }]
  };

  return (
    <View>
      <BarChart
        data={data}
        width={Math.max(width, 240)}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => hexToRgba(colors.primary, opacity),
          labelColor: (opacity = 1) => hexToRgba(colors.mutedText, opacity)
        }}
        fromZero
        showValuesOnTopOfBars
        style={{
          borderRadius: 20
        }}
      />
    </View>
  );
}
