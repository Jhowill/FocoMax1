import React from "react";

import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { TargetScreen } from "@/screens/onboarding/TargetScreen";

export default function OnboardingTargetRoute() {
  const props = useLegacyScreenProps("OnboardingTarget", undefined);
  return <TargetScreen {...props} />;
}
