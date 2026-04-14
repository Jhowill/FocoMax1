import { useLocalSearchParams } from "expo-router";
import React from "react";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { useLegacyScreenProps } from "@/navigation/legacyProps";
import { FocusSessionScreen } from "@/screens/focus/FocusSessionScreen";

function toStringParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function toBooleanParam(value: string | string[] | undefined) {
  const normalized = toStringParam(value);
  return normalized === "1" || normalized === "true";
}

function toNumberParam(value: string | string[] | undefined) {
  const normalized = toStringParam(value);
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function FocusSessionRoute() {
  const params = useLocalSearchParams<{
    taskId?: string;
    fromQuickStart?: string;
    quickDurationMin?: string;
  }>();

  const props = useLegacyScreenProps("FocusSession", {
    taskId: toStringParam(params.taskId),
    fromQuickStart: toBooleanParam(params.fromQuickStart),
    quickDurationMin: toNumberParam(params.quickDurationMin)
  });

  return (
    <ScreenContainer>
      <FocusSessionScreen {...props} />
    </ScreenContainer>
  );
}
