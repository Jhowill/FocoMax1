import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { initDatabase } from "@/db/database";
import { PremiumState } from "@/models/types";
import { getPremiumState } from "@/services/monetizationService";
import { getLocalUser } from "@/services/userService";

type AppContextValue = {
  initialized: boolean;
  loading: boolean;
  error?: string;
  userName: string;
  onboardingDone: boolean;
  premium: PremiumState;
  refreshBootstrap: () => Promise<void>;
};

const defaultPremium: PremiumState = {
  plan: "free",
  premium_active: 0,
  ads_removed: 0
};

const AppContext = createContext<AppContextValue>({
  initialized: false,
  loading: true,
  error: undefined,
  userName: "Usuario",
  onboardingDone: false,
  premium: defaultPremium,
  refreshBootstrap: async () => undefined
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [userName, setUserName] = useState("Usuario");
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [premium, setPremium] = useState<PremiumState>(defaultPremium);

  const refreshBootstrap = useCallback(async () => {
    try {
      setLoading(true);

      await Promise.race([
        (async () => {
          await initDatabase();
          const [user, premiumState] = await Promise.all([getLocalUser(), getPremiumState()]);
          setUserName(user?.nome ?? "Usuario");
          setOnboardingDone(Boolean(user?.onboarding_concluido));
          setPremium(premiumState);
          setInitialized(true);
          setError(undefined);
        })(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("bootstrap-timeout")), 9000);
        })
      ]);
    } catch (err) {
      setError("Nao foi possivel carregar seus dados locais.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBootstrap();
  }, [refreshBootstrap]);

  const value = useMemo(
    () => ({
      initialized,
      loading,
      error,
      userName,
      onboardingDone,
      premium,
      refreshBootstrap
    }),
    [initialized, loading, error, userName, onboardingDone, premium, refreshBootstrap]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => useContext(AppContext);
