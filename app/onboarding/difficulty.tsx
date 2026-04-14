import React from "react";

import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { DifficultyScreen } from "@/screens/onboarding/DifficultyScreen";

export default function OnboardingDifficultyRoute() {
  const props = useLegacyScreenProps("OnboardingDifficulty", undefined);
  return <DifficultyScreen {...props} />;
}
