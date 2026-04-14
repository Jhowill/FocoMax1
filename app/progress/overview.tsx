import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { ProgressOverviewScreen } from "@/screens/progress/ProgressOverviewScreen";

export default function ProgressOverviewRoute() {
  return (
    <ScreenContainer>
      <ProgressOverviewScreen />
    </ScreenContainer>
  );
}
