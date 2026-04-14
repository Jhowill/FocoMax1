import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "@focomax:prefs:";

type BoolKey =
  | "focus_shield_enabled"
  | "ios_focus_hint_enabled"
  | "auto_backup_enabled"
  | "shortcuts_enabled"
  | "large_touch_targets_enabled"
  | "high_contrast_enabled";

type StringKey =
  | "auto_backup_interval_hours"
  | "premium_visual_pack";

const boolDefaults: Record<BoolKey, boolean> = {
  focus_shield_enabled: false,
  ios_focus_hint_enabled: true,
  auto_backup_enabled: false,
  shortcuts_enabled: true,
  large_touch_targets_enabled: true,
  high_contrast_enabled: false
};

const stringDefaults: Record<StringKey, string> = {
  auto_backup_interval_hours: "24",
  premium_visual_pack: "default"
};

const keyOf = (key: string) => `${PREFIX}${key}`;

export async function getBoolPref(key: BoolKey) {
  const raw = await AsyncStorage.getItem(keyOf(key));
  if (raw === null) {
    return boolDefaults[key];
  }
  return raw === "1";
}

export async function setBoolPref(key: BoolKey, value: boolean) {
  await AsyncStorage.setItem(keyOf(key), value ? "1" : "0");
}

export async function getStringPref(key: StringKey) {
  const raw = await AsyncStorage.getItem(keyOf(key));
  return raw ?? stringDefaults[key];
}

export async function setStringPref(key: StringKey, value: string) {
  await AsyncStorage.setItem(keyOf(key), value);
}
