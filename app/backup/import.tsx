import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { BackupImportScreen } from "@/screens/backup/BackupImportScreen";

export default function BackupImportRoute() {
  return (
    <ScreenContainer>
      <BackupImportScreen />
    </ScreenContainer>
  );
}
