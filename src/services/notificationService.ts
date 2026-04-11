import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    } as Notifications.NotificationBehavior)
});

export async function requestNotificationPermission() {
  const permissions = await Notifications.requestPermissionsAsync();
  return permissions.granted;
}

export async function scheduleFocusReminder(minutesFromNow = 30) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "FocoMax",
      body: "Hora de iniciar uma sessão de foco."
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(minutesFromNow * 60, 60)
    }
  });
}

export async function scheduleHabitReminder(title: string, minutesFromNow = 60) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "FocoMax - Hábito",
      body: `Lembrete: ${title}`
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(minutesFromNow * 60, 60)
    }
  });
}
