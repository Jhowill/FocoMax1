import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { useTheme } from "@/theme/ThemeProvider";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 82,
          paddingTop: 10,
          paddingBottom: 10
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.2
        }
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Hoje",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "sunny" : "sunny-outline"} color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Metas",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "flag" : "flag-outline"} color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: "Foco",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "timer" : "timer-outline"} color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habitos",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "checkmark-done-circle" : "checkmark-done-circle-outline"} color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} color={color} size={size} />
          )
        }}
      />
    </Tabs>
  );
}
