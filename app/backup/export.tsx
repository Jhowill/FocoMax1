import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { BackupExportScreen } from "@/screens/backup/BackupExportScreen";

export default function BackupExportRoute() {
  return (
    <ScreenContainer>
      <BackupExportScreen />
    </ScreenContainer>
  );
}
