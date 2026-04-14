import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { GoalListScreen } from "@/screens/goals/GoalListScreen";

export default function GoalsTabRoute() {
  return (
    <ScreenContainer>
      <GoalListScreen />
    </ScreenContainer>
  );
}
