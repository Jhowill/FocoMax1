import React from "react";

import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { GoalScreen } from "@/screens/onboarding/GoalScreen";

export default function OnboardingGoalRoute() {
  const props = useLegacyScreenProps("OnboardingGoal", undefined);
  return <GoalScreen {...props} />;
}
