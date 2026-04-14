import { Linking, Platform } from "react-native";

type Shortcut = {
  id: string;
  label: string;
  description: string;
  url: string;
};

const shortcuts: Shortcut[] = [
  {
    id: "focus_15",
    label: "Foco rapido 15m",
    description: "Abre direto a sessao com 15 minutos.",
    url: "focomax://focus/session/15"
  },
  {
    id: "focus_25",
    label: "Foco rapido 25m",
    description: "Abre direto a sessao com 25 minutos.",
    url: "focomax://focus/session/25"
  },
  {
    id: "focus_50",
    label: "Foco rapido 50m",
    description: "Abre direto a sessao com 50 minutos.",
    url: "focomax://focus/session/50"
  }
];

export function listSystemShortcuts() {
  return shortcuts;
}

export async function openShortcut(url: string) {
  return Linking.openURL(url);
}

export async function openAndroidDistractionShieldSettings() {
  if (Platform.OS !== "android") {
    return false;
  }

  const intents = [
    "android.settings.USAGE_ACCESS_SETTINGS",
    "android.settings.ACCESSIBILITY_SETTINGS",
    "android.settings.SETTINGS"
  ];

  for (const action of intents) {
    try {
      await Linking.sendIntent(action);
      return true;
    } catch {
      // tenta proximo intent
    }
  }

  try {
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
}

export async function openPlatformFocusSettings() {
  if (Platform.OS === "android") {
    return openAndroidDistractionShieldSettings();
  }
  try {
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
}
