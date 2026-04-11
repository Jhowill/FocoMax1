import { NavigatorScreenParams } from "@react-navigation/native";

export type HomeTabParamList = {
  HomeToday: undefined;
  HomeFocus: undefined;
  HomePlanning: undefined;
  HomeProgress: undefined;
  HomeProfile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  OnboardingWelcome: undefined;
  OnboardingGoal: undefined;
  OnboardingDifficulty: undefined;
  OnboardingTarget: undefined;
  OnboardingTheme: undefined;
  OnboardingMode: undefined;
  OnboardingFinish: undefined;

  HomeTabs: NavigatorScreenParams<HomeTabParamList>;
  Tasks: undefined;
  TaskNew: undefined;
  TaskDetail: { id: string };
  TaskEdit: { id: string };

  Habits: undefined;
  HabitNew: undefined;
  HabitDetail: { id: string };
  HabitEdit: { id: string };

  Goals: undefined;
  GoalNew: undefined;
  GoalDetail: { id: string };
  GoalEdit: { id: string };

  FocusSession: { taskId?: string; fromQuickStart?: boolean } | undefined;
  FocusHistory: undefined;
  FocusSummary: { id: string };

  ProgressOverview: undefined;
  ProgressFocus: undefined;
  ProgressTasks: undefined;
  ProgressHabits: undefined;
  ProgressBehavior: undefined;

  Coach: undefined;
  Gamification: undefined;
  Achievements: undefined;
  Rewards: undefined;

  Profile: undefined;
  Settings: undefined;
  SettingsAppearance: undefined;
  SettingsFocus: undefined;
  SettingsNotifications: undefined;
  SettingsData: undefined;
  SettingsPremium: undefined;
  Premium: undefined;
  BackupExport: undefined;
  BackupImport: undefined;
};
