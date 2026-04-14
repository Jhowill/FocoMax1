import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { SettingsScreen } from "@/screens/settings/SettingsScreen";

export default function SettingsRoute() {
  const props = useLegacyScreenProps("Settings", undefined);

  return (
    <ScreenContainer>
      <SettingsScreen {...props} />
    </ScreenContainer>
  );
}
