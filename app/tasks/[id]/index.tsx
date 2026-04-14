import { useLocalSearchParams } from "expo-router";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { TaskDetailScreen } from "@/screens/tasks/TaskDetailScreen";

export default function TaskDetailRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const props = useLegacyScreenProps("TaskDetail", { id: String(params.id ?? "") });

  return (
    <ScreenContainer>
      <TaskDetailScreen {...props} />
    </ScreenContainer>
  );
}
