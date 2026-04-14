import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { GamificationScreen } from "@/screens/gamification/GamificationScreen";

export default function GamificationRoute() {
  return (
    <ScreenContainer>
      <GamificationScreen />
    </ScreenContainer>
  );
}
