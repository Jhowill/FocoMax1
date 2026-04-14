import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { TodayScreen } from "@/screens/home/TodayScreen";

export default function TodayTabRoute() {
  return (
    <ScreenContainer>
      <TodayScreen />
    </ScreenContainer>
  );
}
