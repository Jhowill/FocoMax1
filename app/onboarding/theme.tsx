import React from "react";

import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { ThemeScreen } from "@/screens/onboarding/ThemeScreen";

export default function OnboardingThemeRoute() {
  const props = useLegacyScreenProps("OnboardingTheme", undefined);
  return <ThemeScreen {...props} />;
}
