import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { GoalListScreen } from "@/screens/goals/GoalListScreen";

export default function GoalsRoute() {
  return (
    <ScreenContainer>
      <GoalListScreen />
    </ScreenContainer>
  );
}
