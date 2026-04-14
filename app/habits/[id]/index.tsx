import { useLocalSearchParams } from "expo-router";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { HabitDetailScreen } from "@/screens/habits/HabitDetailScreen";

export default function HabitDetailRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const props = useLegacyScreenProps("HabitDetail", { id: String(params.id ?? "") });

  return (
    <ScreenContainer>
      <HabitDetailScreen {...props} />
    </ScreenContainer>
  );
}
