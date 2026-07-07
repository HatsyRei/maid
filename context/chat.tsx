import useMappings from "@/hooks/use-mappings";
import useStoredString from "@/hooks/use-stored-string";
import { deleteNode, MessageNode } from "message-nodes";
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import { useLLM } from "./language-model";

interface ChatContextProps {
  editing: string | undefined;
  setEditing: Dispatch<SetStateAction<string | undefined>>;
  editInPlace: boolean;
  setEditInPlace: Dispatch<SetStateAction<boolean>>;
  root: string | undefined;
  setRoot: Dispatch<SetStateAction<string | undefined>>;
  mappings: Record<string, MessageNode<string>>;
  setMappings: Dispatch<SetStateAction<Record<string, MessageNode<string>>>>;
  deleteMessage: (id: string) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export function ChatContextProvider({ children }: { children: ReactNode }) {
  const { busy } = useLLM();
  const [root, setRoot] = useStoredString("root-message-id");
  const [editing, setEditing] = useState<string | undefined>(undefined);
  const [editInPlace, setEditInPlace] = useState<boolean>(false);
  const [mappings, setMappings] = useMappings(busy);

  const deleteMessage = useCallback((id: string) => {
    setMappings((prev) => deleteNode(prev, id));
  }, [setMappings]);

  const value = useMemo(() => ({
    editing,
    setEditing,
    editInPlace,
    setEditInPlace,
    root,
    setRoot,
    mappings,
    setMappings,
    deleteMessage,
  }), [editing, setEditing, editInPlace, setEditInPlace, root, setRoot, mappings, setMappings, deleteMessage]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatContextProvider");
  }

  return context;
}