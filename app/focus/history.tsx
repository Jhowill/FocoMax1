import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { FocusHistoryScreen } from "@/screens/focus/FocusHistoryScreen";

export default function FocusHistoryRoute() {
  const props = useLegacyScreenProps("FocusHistory", undefined);

  return (
    <ScreenContainer>
      <FocusHistoryScreen {...props} />
    </ScreenContainer>
  );
}
