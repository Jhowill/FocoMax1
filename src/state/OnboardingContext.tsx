import React, { createContext, useContext, useMemo, useState } from "react";

type OnboardingData = {
  objetivoPrincipal: string;
  nivelDificuldade: string;
  metaFocoDia: number;
  metaTarefasDia: number;
  habitoPrincipal: string;
  tema: "light" | "dark" | "auto";
  modoUso: "iniciante" | "equilibrado" | "intenso";
};

type OnboardingContextValue = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  reset: () => void;
};

const initial: OnboardingData = {
  objetivoPrincipal: "Criar disciplina",
  nivelDificuldade: "médio",
  metaFocoDia: 60,
  metaTarefasDia: 3,
  habitoPrincipal: "Planejar o dia",
  tema: "auto",
  modoUso: "equilibrado"
};

const OnboardingContext = createContext<OnboardingContextValue>({
  data: initial,
  update: () => undefined,
  reset: () => undefined
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initial);

  const value = useMemo(
    () => ({
      data,
      update: (patch: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...patch })),
      reset: () => setData(initial)
    }),
    [data]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export const useOnboarding = () => useContext(OnboardingContext);
