import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { HomeTabsNavigator } from "@/navigation/HomeTabsNavigator";
import { RootStackParamList } from "@/navigation/types";
import { BackupExportScreen } from "@/screens/backup/BackupExportScreen";
import { BackupImportScreen } from "@/screens/backup/BackupImportScreen";
import { CoachScreen } from "@/screens/coach/CoachScreen";
import { FocusHistoryScreen } from "@/screens/focus/FocusHistoryScreen";
import { FocusSessionScreen } from "@/screens/focus/FocusSessionScreen";
import { FocusSummaryScreen } from "@/screens/focus/FocusSummaryScreen";
import { GamificationScreen } from "@/screens/gamification/GamificationScreen";
import { AchievementsScreen } from "@/screens/gamification/AchievementsScreen";
import { RewardsScreen } from "@/screens/gamification/RewardsScreen";
import { GoalDetailScreen } from "@/screens/goals/GoalDetailScreen";
import { GoalEditScreen } from "@/screens/goals/GoalEditScreen";
import { GoalListScreen } from "@/screens/goals/GoalListScreen";
import { GoalNewScreen } from "@/screens/goals/GoalNewScreen";
import { HabitDetailScreen } from "@/screens/habits/HabitDetailScreen";
import { HabitEditScreen } from "@/screens/habits/HabitEditScreen";
import { HabitListScreen } from "@/screens/habits/HabitListScreen";
import { HabitNewScreen } from "@/screens/habits/HabitNewScreen";
import { DifficultyScreen } from "@/screens/onboarding/DifficultyScreen";
import { FinishScreen } from "@/screens/onboarding/FinishScreen";
import { GoalScreen } from "@/screens/onboarding/GoalScreen";
import { ModeScreen } from "@/screens/onboarding/ModeScreen";
import { TargetScreen } from "@/screens/onboarding/TargetScreen";
import { ThemeScreen } from "@/screens/onboarding/ThemeScreen";
import { WelcomeScreen } from "@/screens/onboarding/WelcomeScreen";
import { PremiumScreen } from "@/screens/premium/PremiumScreen";
import { ProgressBehaviorScreen } from "@/screens/progress/ProgressBehaviorScreen";
import { ProgressFocusScreen } from "@/screens/progress/ProgressFocusScreen";
import { ProgressHabitsScreen } from "@/screens/progress/ProgressHabitsScreen";
import { ProgressOverviewScreen } from "@/screens/progress/ProgressOverviewScreen";
import { ProgressTasksScreen } from "@/screens/progress/ProgressTasksScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { SettingsAppearanceScreen } from "@/screens/settings/SettingsAppearanceScreen";
import { SettingsDataScreen } from "@/screens/settings/SettingsDataScreen";
import { SettingsFocusScreen } from "@/screens/settings/SettingsFocusScreen";
import { SettingsNotificationsScreen } from "@/screens/settings/SettingsNotificationsScreen";
import { SettingsPremiumScreen } from "@/screens/settings/SettingsPremiumScreen";
import { SettingsScreen } from "@/screens/settings/SettingsScreen";
import { SplashScreen } from "@/screens/SplashScreen";
import { TaskDetailScreen } from "@/screens/tasks/TaskDetailScreen";
import { TaskEditScreen } from "@/screens/tasks/TaskEditScreen";
import { TaskListScreen } from "@/screens/tasks/TaskListScreen";
import { TaskNewScreen } from "@/screens/tasks/TaskNewScreen";
import { useTheme } from "@/theme/ThemeProvider";

const Stack = createNativeStackNavigator<RootStackParamList>();

function wrapScreen(Component: React.ComponentType<any>) {
  return function Wrapped(props: any) {
    return (
      <ScreenContainer>
        <Component {...props} />
      </ScreenContainer>
    );
  };
}

const WrappedTaskList = wrapScreen(TaskListScreen);
const WrappedTaskNew = wrapScreen(TaskNewScreen);
const WrappedTaskDetail = wrapScreen(TaskDetailScreen);
const WrappedTaskEdit = wrapScreen(TaskEditScreen);
const WrappedHabitList = wrapScreen(HabitListScreen);
const WrappedHabitNew = wrapScreen(HabitNewScreen);
const WrappedHabitDetail = wrapScreen(HabitDetailScreen);
const WrappedHabitEdit = wrapScreen(HabitEditScreen);
const WrappedGoalList = wrapScreen(GoalListScreen);
const WrappedGoalNew = wrapScreen(GoalNewScreen);
const WrappedGoalDetail = wrapScreen(GoalDetailScreen);
const WrappedGoalEdit = wrapScreen(GoalEditScreen);
const WrappedFocusSession = wrapScreen(FocusSessionScreen);
const WrappedFocusHistory = wrapScreen(FocusHistoryScreen);
const WrappedFocusSummary = wrapScreen(FocusSummaryScreen);
const WrappedProgressOverview = wrapScreen(ProgressOverviewScreen);
const WrappedProgressFocus = wrapScreen(ProgressFocusScreen);
const WrappedProgressTasks = wrapScreen(ProgressTasksScreen);
const WrappedProgressHabits = wrapScreen(ProgressHabitsScreen);
const WrappedProgressBehavior = wrapScreen(ProgressBehaviorScreen);
const WrappedCoach = wrapScreen(CoachScreen);
const WrappedGamification = wrapScreen(GamificationScreen);
const WrappedAchievements = wrapScreen(AchievementsScreen);
const WrappedRewards = wrapScreen(RewardsScreen);
const WrappedProfile = wrapScreen(ProfileScreen);
const WrappedSettings = wrapScreen(SettingsScreen);
const WrappedSettingsAppearance = wrapScreen(SettingsAppearanceScreen);
const WrappedSettingsFocus = wrapScreen(SettingsFocusScreen);
const WrappedSettingsNotifications = wrapScreen(SettingsNotificationsScreen);
const WrappedSettingsData = wrapScreen(SettingsDataScreen);
const WrappedSettingsPremium = wrapScreen(SettingsPremiumScreen);
const WrappedPremium = wrapScreen(PremiumScreen);
const WrappedBackupExport = wrapScreen(BackupExportScreen);
const WrappedBackupImport = wrapScreen(BackupImportScreen);

export function RootNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "700"
        },
        headerTintColor: colors.text,
        contentStyle: {
          backgroundColor: colors.background
        }
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />

      <Stack.Screen name="OnboardingWelcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingGoal" component={GoalScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingDifficulty" component={DifficultyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingTarget" component={TargetScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingTheme" component={ThemeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingMode" component={ModeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingFinish" component={FinishScreen} options={{ headerShown: false }} />

      <Stack.Screen name="HomeTabs" component={HomeTabsNavigator} options={{ headerShown: false }} />

      <Stack.Screen name="Tasks" component={WrappedTaskList} options={{ title: "Tarefas" }} />
      <Stack.Screen name="TaskNew" component={WrappedTaskNew} options={{ title: "Nova tarefa" }} />
      <Stack.Screen name="TaskDetail" component={WrappedTaskDetail} options={{ title: "Detalhe da tarefa" }} />
      <Stack.Screen name="TaskEdit" component={WrappedTaskEdit} options={{ title: "Editar tarefa" }} />

      <Stack.Screen name="Habits" component={WrappedHabitList} options={{ title: "Hábitos" }} />
      <Stack.Screen name="HabitNew" component={WrappedHabitNew} options={{ title: "Novo hábito" }} />
      <Stack.Screen name="HabitDetail" component={WrappedHabitDetail} options={{ title: "Detalhe do hábito" }} />
      <Stack.Screen name="HabitEdit" component={WrappedHabitEdit} options={{ title: "Editar hábito" }} />

      <Stack.Screen name="Goals" component={WrappedGoalList} options={{ title: "Metas" }} />
      <Stack.Screen name="GoalNew" component={WrappedGoalNew} options={{ title: "Nova meta" }} />
      <Stack.Screen name="GoalDetail" component={WrappedGoalDetail} options={{ title: "Detalhe da meta" }} />
      <Stack.Screen name="GoalEdit" component={WrappedGoalEdit} options={{ title: "Editar meta" }} />

      <Stack.Screen name="FocusSession" component={WrappedFocusSession} options={{ title: "Sessão de foco" }} />
      <Stack.Screen name="FocusHistory" component={WrappedFocusHistory} options={{ title: "Histórico de foco" }} />
      <Stack.Screen name="FocusSummary" component={WrappedFocusSummary} options={{ title: "Resumo da sessão" }} />

      <Stack.Screen name="ProgressOverview" component={WrappedProgressOverview} options={{ title: "Progresso geral" }} />
      <Stack.Screen name="ProgressFocus" component={WrappedProgressFocus} options={{ title: "Análise de foco" }} />
      <Stack.Screen name="ProgressTasks" component={WrappedProgressTasks} options={{ title: "Análise de tarefas" }} />
      <Stack.Screen name="ProgressHabits" component={WrappedProgressHabits} options={{ title: "Análise de hábitos" }} />
      <Stack.Screen name="ProgressBehavior" component={WrappedProgressBehavior} options={{ title: "Comportamento" }} />

      <Stack.Screen name="Coach" component={WrappedCoach} options={{ title: "Coach de foco" }} />
      <Stack.Screen name="Gamification" component={WrappedGamification} options={{ title: "Gamificação" }} />
      <Stack.Screen name="Achievements" component={WrappedAchievements} options={{ title: "Conquistas" }} />
      <Stack.Screen name="Rewards" component={WrappedRewards} options={{ title: "Recompensas" }} />

      <Stack.Screen name="Profile" component={WrappedProfile} options={{ title: "Conta local" }} />
      <Stack.Screen name="Settings" component={WrappedSettings} options={{ title: "Configurações" }} />
      <Stack.Screen name="SettingsAppearance" component={WrappedSettingsAppearance} options={{ title: "Aparência" }} />
      <Stack.Screen name="SettingsFocus" component={WrappedSettingsFocus} options={{ title: "Foco" }} />
      <Stack.Screen name="SettingsNotifications" component={WrappedSettingsNotifications} options={{ title: "Notificações" }} />
      <Stack.Screen name="SettingsData" component={WrappedSettingsData} options={{ title: "Dados" }} />
      <Stack.Screen name="SettingsPremium" component={WrappedSettingsPremium} options={{ title: "Premium" }} />
      <Stack.Screen name="Premium" component={WrappedPremium} options={{ title: "FocoMax Premium" }} />
      <Stack.Screen name="BackupExport" component={WrappedBackupExport} options={{ title: "Exportar backup" }} />
      <Stack.Screen name="BackupImport" component={WrappedBackupImport} options={{ title: "Importar backup" }} />
    </Stack.Navigator>
  );
}
