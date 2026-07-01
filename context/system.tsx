import useSyncedString from '@/hooks/use-synced-string';
import useTheme from '@/hooks/use-theme';
import { ColorScheme } from '@/utilities/color-scheme';
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import 'react-native-url-polyfill/auto';

interface SystemContextProps {
  colorScheme: ColorScheme;
  userName: string | undefined;
  setUserName: (name: string | undefined) => void;
  assistantName: string | undefined;
  setAssistantName: (name: string | undefined) => void;
  systemPrompt: string | undefined;
  setSystemPrompt: (prompt: string | undefined) => void;
}

const SystemContext = createContext<SystemContextProps | undefined>(undefined);

export function SystemContextProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useSyncedString({
    key: "user_name",
    defaultValue: "User",
  });

  const [assistantName, setAssistantName] = useSyncedString({
    key: "assistant_name",
    defaultValue: "Assistant",
  });

  const [systemPrompt, setSystemPrompt] = useSyncedString({
    key: "system_prompt",
    defaultValue: "",
  });

  const { colorScheme } = useTheme();
  
  const value = useMemo(() => ({
    userName,
    setUserName,
    assistantName,
    setAssistantName,
    systemPrompt,
    setSystemPrompt,
    colorScheme,
  }), [userName, setUserName, assistantName, setAssistantName, systemPrompt, setSystemPrompt, colorScheme]);

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);

  if (!context) {
    throw new Error("useSystem must be used within a SystemContextProvider");
  }

  return context;
}