import { useLocalSearchParams } from "expo-router";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { FocusSummaryScreen } from "@/screens/focus/FocusSummaryScreen";

export default function FocusSummaryRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const props = useLegacyScreenProps("FocusSummary", { id: String(params.id ?? "") });

  return (
    <ScreenContainer>
      <FocusSummaryScreen {...props} />
    </ScreenContainer>
  );
}
