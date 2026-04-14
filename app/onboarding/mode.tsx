import React from "react";

import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { ModeScreen } from "@/screens/onboarding/ModeScreen";

export default function OnboardingModeRoute() {
  const props = useLegacyScreenProps("OnboardingMode", undefined);
  return <ModeScreen {...props} />;
}
