import { LinkingOptions } from "@react-navigation/native";

import { RootStackParamList } from "@/navigation/types";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["focomax://"],
  config: {
    screens: {
      Splash: "splash",
      OnboardingWelcome: "onboarding/welcome",
      OnboardingGoal: "onboarding/goal",
      OnboardingDifficulty: "onboarding/difficulty",
      OnboardingTarget: "onboarding/target",
      OnboardingTheme: "onboarding/theme",
      OnboardingMode: "onboarding/mode",
      OnboardingFinish: "onboarding/finish",
      HomeTabs: {
        path: "home",
        screens: {
          HomeToday: "today",
          HomeFocus: "focus",
          HomePlanning: "planning",
          HomeProgress: "progress",
          HomeProfile: "profile"
        }
      },
      Tasks: "tasks",
      TaskNew: "tasks/new",
      TaskDetail: "tasks/:id",
      TaskEdit: "tasks/:id/edit",
      Habits: "habits",
      HabitNew: "habits/new",
      HabitDetail: "habits/:id",
      HabitEdit: "habits/:id/edit",
      Goals: "goals",
      GoalNew: "goals/new",
      GoalDetail: "goals/:id",
      GoalEdit: "goals/:id/edit",
      FocusSession: "focus/session",
      FocusHistory: "focus/history",
      FocusSummary: "focus/session/summary/:id",
      ProgressOverview: "progress/overview",
      ProgressFocus: "progress/focus",
      ProgressTasks: "progress/tasks",
      ProgressHabits: "progress/habits",
      ProgressBehavior: "progress/behavior",
      Coach: "coach",
      Gamification: "gamification",
      Achievements: "achievements",
      Rewards: "rewards",
      Profile: "profile",
      Settings: "settings",
      SettingsAppearance: "settings/appearance",
      SettingsFocus: "settings/focus",
      SettingsNotifications: "settings/notifications",
      SettingsData: "settings/data",
      SettingsPremium: "settings/premium",
      Premium: "premium",
      BackupExport: "backup/export",
      BackupImport: "backup/import"
    }
  }
};
