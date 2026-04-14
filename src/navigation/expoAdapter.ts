import { Href, Router, useRouter } from "expo-router";
import { useMemo } from "react";

import { RootStackParamList } from "@/navigation/types";

type RouteName = keyof RootStackParamList;

function homeTabPath(screen?: string) {
  switch (screen) {
    case "HomeFocus":
      return "/(tabs)/focus";
    case "HomePlanning":
      return "/(tabs)/goals";
    case "HomeProgress":
      return "/(tabs)/insights";
    case "HomeProfile":
      return "/profile";
    case "HomeToday":
    default:
      return "/(tabs)/today";
  }
}

function buildHref(name: RouteName, params?: RootStackParamList[RouteName]): Href {
  switch (name) {
    case "Splash":
      return "/splash";
    case "OnboardingWelcome":
      return "/onboarding/welcome";
    case "OnboardingGoal":
      return "/onboarding/goal";
    case "OnboardingDifficulty":
      return "/onboarding/difficulty";
    case "OnboardingTarget":
      return "/onboarding/target";
    case "OnboardingTheme":
      return "/onboarding/theme";
    case "OnboardingMode":
      return "/onboarding/mode";
    case "OnboardingFinish":
      return "/onboarding/finish";
    case "HomeTabs":
      return homeTabPath((params as { screen?: string } | undefined)?.screen) as Href;
    case "Tasks":
      return "/tasks";
    case "TaskNew":
      return "/tasks/new";
    case "TaskDetail":
      return `/tasks/${(params as { id: string }).id}` as Href;
    case "TaskEdit":
      return `/tasks/${(params as { id: string }).id}/edit` as Href;
    case "Habits":
      return "/habits";
    case "HabitNew":
      return "/habits/new";
    case "HabitDetail":
      return `/habits/${(params as { id: string }).id}` as Href;
    case "HabitEdit":
      return `/habits/${(params as { id: string }).id}/edit` as Href;
    case "Goals":
      return "/goals";
    case "GoalNew":
      return "/goals/new";
    case "GoalDetail":
      return `/goals/${(params as { id: string }).id}` as Href;
    case "GoalEdit":
      return `/goals/${(params as { id: string }).id}/edit` as Href;
    case "FocusSession": {
      const query = params ? (params as { taskId?: string; fromQuickStart?: boolean; quickDurationMin?: number }) : {};
      const search: string[] = [];
      if (query.taskId) search.push(`taskId=${query.taskId}`);
      if (query.fromQuickStart) search.push("fromQuickStart=1");
      if (typeof query.quickDurationMin === "number") search.push(`quickDurationMin=${query.quickDurationMin}`);
      const suffix = search.length ? `?${search.join("&")}` : "";
      return `/focus/session${suffix}` as Href;
    }
    case "FocusHistory":
      return "/focus/history";
    case "FocusSummary":
      return `/focus/session/summary/${(params as { id: string }).id}` as Href;
    case "ProgressOverview":
      return "/progress/overview";
    case "ProgressFocus":
      return "/progress/focus";
    case "ProgressTasks":
      return "/progress/tasks";
    case "ProgressHabits":
      return "/progress/habits";
    case "ProgressBehavior":
      return "/progress/behavior";
    case "Coach":
      return "/coach";
    case "Gamification":
      return "/gamification";
    case "Achievements":
      return "/achievements";
    case "Rewards":
      return "/rewards";
    case "Profile":
      return "/profile";
    case "Settings":
      return "/settings";
    case "SettingsAppearance":
      return "/settings/appearance";
    case "SettingsFocus":
      return "/settings/focus";
    case "SettingsNotifications":
      return "/settings/notifications";
    case "SettingsData":
      return "/settings/data";
    case "SettingsPremium":
      return "/settings/premium";
    case "Premium":
      return "/premium";
    case "BackupExport":
      return "/backup/export";
    case "BackupImport":
      return "/backup/import";
    default:
      return "/(tabs)/today";
  }
}

export function createCompatNavigation(router: Router) {
  return {
    navigate: <K extends RouteName>(name: K, params?: RootStackParamList[K]) => {
      router.push(buildHref(name, params));
    },
    replace: <K extends RouteName>(name: K, params?: RootStackParamList[K]) => {
      router.replace(buildHref(name, params));
    },
    reset: (state: { index?: number; routes: { name: RouteName; params?: RootStackParamList[RouteName] }[] }) => {
      if (!state?.routes?.length) {
        router.replace("/(tabs)/today");
        return;
      }

      const safeIndex =
        typeof state.index === "number"
          ? Math.min(Math.max(state.index, 0), state.routes.length - 1)
          : state.routes.length - 1;
      const target = state.routes[safeIndex];
      router.replace(buildHref(target.name, target.params));
    },
    goBack: () => router.back(),
    canGoBack: () => router.canGoBack()
  };
}

export function useCompatNavigation() {
  const router = useRouter();
  return useMemo(() => createCompatNavigation(router), [router]);
}
