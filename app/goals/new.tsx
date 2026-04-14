import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { GoalNewScreen } from "@/screens/goals/GoalNewScreen";

export default function GoalNewRoute() {
  const props = useLegacyScreenProps("GoalNew", undefined);
  return (
    <ScreenContainer>
      <GoalNewScreen {...props} />
    </ScreenContainer>
  );
}
