import { useRouter } from "expo-router";
import { useMemo } from "react";

import { createCompatNavigation } from "@/navigation/expoAdapter";
import { RootStackParamList } from "@/navigation/types";

export function useLegacyScreenProps<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params: RootStackParamList[RouteName]
) {
  const router = useRouter();
  const navigation = useMemo(() => createCompatNavigation(router), [router]);

  return {
    navigation: navigation as any,
    route: {
      key: name,
      name,
      params
    } as any
  };
}
