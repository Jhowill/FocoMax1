import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { ProgressTasksScreen } from "@/screens/progress/ProgressTasksScreen";

export default function ProgressTasksRoute() {
  return (
    <ScreenContainer>
      <ProgressTasksScreen />
    </ScreenContainer>
  );
}
