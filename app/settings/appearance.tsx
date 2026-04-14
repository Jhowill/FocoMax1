import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { SettingsAppearanceScreen } from "@/screens/settings/SettingsAppearanceScreen";

export default function SettingsAppearanceRoute() {
  return (
    <ScreenContainer>
      <SettingsAppearanceScreen />
    </ScreenContainer>
  );
}
