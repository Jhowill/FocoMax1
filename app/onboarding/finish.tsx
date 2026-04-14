import React from "react";

import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { FinishScreen } from "@/screens/onboarding/FinishScreen";

export default function OnboardingFinishRoute() {
  const props = useLegacyScreenProps("OnboardingFinish", undefined);
  return <FinishScreen {...props} />;
}
