import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { HomeTabParamList } from "@/navigation/types";
import { FocusHomeScreen } from "@/screens/home/FocusHomeScreen";
import { PlanningHomeScreen } from "@/screens/home/PlanningHomeScreen";
import { ProfileHomeScreen } from "@/screens/home/ProfileHomeScreen";
import { ProgressHomeScreen } from "@/screens/home/ProgressHomeScreen";
import { TodayScreen } from "@/screens/home/TodayScreen";
import { useTheme } from "@/theme/ThemeProvider";

const Tab = createBottomTabNavigator<HomeTabParamList>();

function wrapScreen(Component: React.ComponentType) {
  return function Wrapped() {
    return (
      <ScreenContainer>
        <Component />
      </ScreenContainer>
    );
  };
}

const TodayTab = wrapScreen(TodayScreen);
const FocusTab = wrapScreen(FocusHomeScreen);
const PlanningTab = wrapScreen(PlanningHomeScreen);
const ProgressTab = wrapScreen(ProgressHomeScreen);
const ProfileTab = wrapScreen(ProfileHomeScreen);

export function HomeTabsNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="HomeToday"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 6,
          paddingBottom: 10
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        }
      }}
    >
      <Tab.Screen
        name="HomeToday"
        component={TodayTab}
        options={{
          title: "Hoje",
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "sunny" : "sunny-outline"} color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="HomeFocus"
        component={FocusTab}
        options={{
          title: "Foco",
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "timer" : "timer-outline"} color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="HomePlanning"
        component={PlanningTab}
        options={{
          title: "Plano",
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "calendar" : "calendar-outline"} color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="HomeProgress"
        component={ProgressTab}
        options={{
          title: "Progresso",
          tabBarIcon: ({ color, size, focused }) =>
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="HomeProfile"
        component={ProfileTab}
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) =>
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}
