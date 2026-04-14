import { useLocalSearchParams } from "expo-router";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { TaskEditScreen } from "@/screens/tasks/TaskEditScreen";

export default function TaskEditRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const props = useLegacyScreenProps("TaskEdit", { id: String(params.id ?? "") });

  return (
    <ScreenContainer>
      <TaskEditScreen {...props} />
    </ScreenContainer>
  );
}
