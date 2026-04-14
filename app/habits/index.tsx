import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { HabitListScreen } from "@/screens/habits/HabitListScreen";

export default function HabitsRoute() {
  return (
    <ScreenContainer>
      <HabitListScreen />
    </ScreenContainer>
  );
}
