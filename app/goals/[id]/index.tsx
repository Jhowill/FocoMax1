import { useLocalSearchParams } from "expo-router";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { GoalDetailScreen } from "@/screens/goals/GoalDetailScreen";

export default function GoalDetailRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const props = useLegacyScreenProps("GoalDetail", { id: String(params.id ?? "") });

  return (
    <ScreenContainer>
      <GoalDetailScreen {...props} />
    </ScreenContainer>
  );
}
