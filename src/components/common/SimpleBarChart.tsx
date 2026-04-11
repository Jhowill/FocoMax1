import React from "react";
import { Dimensions, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

import { useTheme } from "@/theme/ThemeProvider";

export function SimpleBarChart({
  labels,
  values
}: {
  labels: string[];
  values: number[];
}) {
  const { colors, isDark } = useTheme();
  const width = Dimensions.get("window").width - 58;
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
          color: (opacity = 1) =>
            isDark ? `rgba(96, 165, 250, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
          labelColor: (opacity = 1) => (isDark ? `rgba(226, 232, 240, ${opacity})` : `rgba(71, 85, 105, ${opacity})`)
        }}
        fromZero
        showValuesOnTopOfBars
        style={{
          borderRadius: 12
        }}
      />
    </View>
  );
}
