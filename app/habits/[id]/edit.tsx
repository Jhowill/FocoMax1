import { useLocalSearchParams } from "expo-router";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { HabitEditScreen } from "@/screens/habits/HabitEditScreen";

export default function HabitEditRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const props = useLegacyScreenProps("HabitEdit", { id: String(params.id ?? "") });

  return (
    <ScreenContainer>
      <HabitEditScreen {...props} />
    </ScreenContainer>
  );
}
