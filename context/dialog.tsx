import AlertDialogView, { AlertButton } from "@/components/views/alert-dialog-view";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

interface DialogState {
  title?: string;
  message?: string;
  buttons: AlertButton[];
}

interface DialogContextProps {
  alert: (title?: string, message?: string, buttons?: AlertButton[]) => void;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export function DialogContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);

  const alert = useCallback((title?: string, message?: string, buttons?: AlertButton[]) => {
    setState({
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: "OK" }],
    });
  }, []);

  const dismiss = useCallback(() => setState(null), []);

  const value = useMemo(() => ({ alert }), [alert]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AlertDialogView
        visible={state !== null}
        title={state?.title}
        message={state?.message}
        buttons={state?.buttons ?? []}
        onDismiss={dismiss}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("useDialog must be used within a DialogContextProvider");
  }

  return context;
}
