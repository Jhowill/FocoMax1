import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { TaskListScreen } from "@/screens/tasks/TaskListScreen";

export default function TasksRoute() {
  return (
    <ScreenContainer>
      <TaskListScreen />
    </ScreenContainer>
  );
}
