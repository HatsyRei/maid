import { createContext, useContext, useMemo } from "react";
import { OpenAIProvider, useOpenAI } from "./open-ai";
import { LanguageModelContextProps, LanguageModelProps } from "./types";

const LanguageModelContext = createContext<LanguageModelContextProps | undefined>(undefined);

function LanguageModelManagementProvider({ children }: { children: React.ReactNode }) {
  const openAI = useOpenAI();

  const type = "Open AI";

  const getProps = (): LanguageModelProps => {
    return openAI;
  };

  const values = useMemo<LanguageModelContextProps>(() => ({
    type,
    ...getProps(),
  }), [openAI]);

  return (
    <LanguageModelContext.Provider value={values}>
      {children}
    </LanguageModelContext.Provider>
  );
}

export function LanguageModelProvider({ children }: { children: React.ReactNode }) {
  return (
    <OpenAIProvider>
      <LanguageModelManagementProvider>
        {children}
      </LanguageModelManagementProvider>
    </OpenAIProvider>
  );
}

export function useLLM() {
  const context = useContext(LanguageModelContext);

  if (!context) {
    throw new Error("useLLM must be used within a LanguageModelProvider");
  }

  return context;
}
