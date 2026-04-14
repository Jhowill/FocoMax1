import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { HabitNewScreen } from "@/screens/habits/HabitNewScreen";

export default function HabitNewRoute() {
  const props = useLegacyScreenProps("HabitNew", undefined);
  return (
    <ScreenContainer>
      <HabitNewScreen {...props} />
    </ScreenContainer>
  );
}
