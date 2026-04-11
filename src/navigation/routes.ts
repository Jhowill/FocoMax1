export const ROUTES = {
  Splash: "Splash",
  OnboardingWelcome: "OnboardingWelcome",
  OnboardingGoal: "OnboardingGoal",
  OnboardingDifficulty: "OnboardingDifficulty",
  OnboardingTarget: "OnboardingTarget",
  OnboardingTheme: "OnboardingTheme",
  OnboardingMode: "OnboardingMode",
  OnboardingFinish: "OnboardingFinish",

  HomeTabs: "HomeTabs",
  HomeToday: "HomeToday",
  HomeFocus: "HomeFocus",
  HomePlanning: "HomePlanning",
  HomeProgress: "HomeProgress",
  HomeProfile: "HomeProfile",

  Tasks: "Tasks",
  TaskNew: "TaskNew",
  TaskDetail: "TaskDetail",
  TaskEdit: "TaskEdit",

  Habits: "Habits",
  HabitNew: "HabitNew",
  HabitDetail: "HabitDetail",
  HabitEdit: "HabitEdit",

  Goals: "Goals",
  GoalNew: "GoalNew",
  GoalDetail: "GoalDetail",
  GoalEdit: "GoalEdit",

  FocusSession: "FocusSession",
  FocusHistory: "FocusHistory",
  FocusSummary: "FocusSummary",

  ProgressOverview: "ProgressOverview",
  ProgressFocus: "ProgressFocus",
  ProgressTasks: "ProgressTasks",
  ProgressHabits: "ProgressHabits",
  ProgressBehavior: "ProgressBehavior",

  Coach: "Coach",
  Gamification: "Gamification",
  Achievements: "Achievements",
  Rewards: "Rewards",

  Profile: "Profile",
  Settings: "Settings",
  SettingsAppearance: "SettingsAppearance",
  SettingsFocus: "SettingsFocus",
  SettingsNotifications: "SettingsNotifications",
  SettingsData: "SettingsData",
  SettingsPremium: "SettingsPremium",
  Premium: "Premium",
  BackupExport: "BackupExport",
  BackupImport: "BackupImport"
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
