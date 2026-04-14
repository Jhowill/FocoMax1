import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { TaskNewScreen } from "@/screens/tasks/TaskNewScreen";

export default function TaskNewRoute() {
  const props = useLegacyScreenProps("TaskNew", undefined);
  return (
    <ScreenContainer>
      <TaskNewScreen {...props} />
    </ScreenContainer>
  );
}
