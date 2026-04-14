import React from "react";

import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { WelcomeScreen } from "@/screens/onboarding/WelcomeScreen";

export default function OnboardingWelcomeRoute() {
  const props = useLegacyScreenProps("OnboardingWelcome", undefined);
  return <WelcomeScreen {...props} />;
}
