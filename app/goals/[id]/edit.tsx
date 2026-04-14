import { useLocalSearchParams } from "expo-router";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { GoalEditScreen } from "@/screens/goals/GoalEditScreen";

export default function GoalEditRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const props = useLegacyScreenProps("GoalEdit", { id: String(params.id ?? "") });

  return (
    <ScreenContainer>
      <GoalEditScreen {...props} />
    </ScreenContainer>
  );
}
