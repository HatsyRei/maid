import useStoredRecord from "@/hooks/use-stored-record";
import useStoredString from "@/hooks/use-stored-string";
import { fetch as expoFetch } from "expo/fetch";
import { MessageNode } from "message-nodes";
import OpenAI from 'openai';
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { OpenAIContextProps } from "./types";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

function isOfficialOpenAIEndpoint(baseURL: string): boolean {
  try {
    const normalized = baseURL.replace(/\/+$/, "");
    const official = DEFAULT_BASE_URL.replace(/\/+$/, "");
    return normalized === official;
  } catch {
    return false;
  }
}

const OpenAIContext = createContext<OpenAIContextProps | undefined>(undefined);

export function OpenAIProvider({ children }: { children: React.ReactNode }) {
  const abortRef = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const [baseURL, setBaseURL] = useStoredString("open-ai-base-url", DEFAULT_BASE_URL);
  const [apiKey, setApiKey] = useStoredString("open-ai-api-key");
  const [model, setModel] = useStoredString("open-ai-model");

  const [headers, setHeaders] = useStoredRecord<string, string>("open-ai-headers");
  const [parameters, setParameters] = useStoredRecord("open-ai-parameters");

  const [openai, setOpenAI] = useState<OpenAI | undefined>(undefined);
  const [models, setModels] = useState<Array<string>>([]);

  useEffect(() => {
    const resolvedBaseURL = baseURL ?? DEFAULT_BASE_URL;
    const requiresApiKey = isOfficialOpenAIEndpoint(resolvedBaseURL);

    if (requiresApiKey && !apiKey) {
      console.warn("OpenAI API key not set");
      setOpenAI(undefined);
      return;
    }

    try {
      new URL(resolvedBaseURL);
    } catch {
      setOpenAI(undefined);
      return;
    }

    try {
      const openaiInstance = new OpenAI({
        // OpenAI SDK expects a key. For local compatible endpoints, allow a placeholder.
        apiKey: apiKey ?? "local-openai-compatible",
        baseURL: resolvedBaseURL,
        defaultHeaders: headers,
        fetch: expoFetch as typeof fetch,
      });
      setOpenAI(openaiInstance);
    } catch (error) {
      console.warn("Failed to create OpenAI instance:", error);
      setOpenAI(undefined);
    }
  }, [apiKey, baseURL, headers]);

  useEffect(() => {
    const fetchModels = async () => {
      if (!openai) {
        setModels([]);
        return;
      }

      try {
        const response = await openai.models.list();
        setModels(response.data.map((model) => model.id));
      } catch (error) {
        console.error("Error fetching OpenAI models:", error);
        setModels([]);
      }
    };

    fetchModels();
  }, [openai]);

  const prompt = async (
    messages: Array<MessageNode>,
    onUpdate: (message: string) => void
  ) => {
    if (!openai) {
      console.warn("OpenAI not initialized");
      return;
    }

    if (!model) {
      console.warn("OpenAI model not set");
      return;
    }

    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // The conversation includes an empty assistant placeholder node that
      // receives the streamed response. Sending it to the server (as
      // {"role":"assistant","content":""}) makes OpenAI-compatible backends like
      // llama.cpp treat it as an assistant prefix to continue, corrupting the
      // chat template and producing gibberish. Drop trailing empty assistant
      // messages before sending.
      const requestMessages = messages.slice();
      while (
        requestMessages.length > 0 &&
        requestMessages[requestMessages.length - 1].role === "assistant" &&
        requestMessages[requestMessages.length - 1].content.trim() === ""
      ) {
        requestMessages.pop();
      }

      const stream = await openai.chat.completions.create({
        model,
        messages: requestMessages.map((msg) => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content,
        })),
        stream: true,
        ...parameters,
      }, {
        maxRetries: 3,
        signal: controller.signal,
      });

      for await (const event of stream) {
        if (controller.signal.aborted) break;

        const chunk = event.choices[0]?.delta?.content;
        if (chunk) {
          onUpdate(chunk);
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("Error during OpenAI completion:", error);
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  };

  const stop = async () => {
    abortRef.current?.abort();
  };

  const resetBaseURL = () => {
    setBaseURL(DEFAULT_BASE_URL);
  };

  const value = {
    ready: !!openai && !!model && models.includes(model),
    busy,
    baseURL,
    setBaseURL,
    resetBaseURL,
    apiKey,
    setApiKey,
    model,
    setModel,
    models,
    parameters,
    setParameters,
    headers,
    setHeaders,
    prompt,
    stop
  };

  return (
    <OpenAIContext.Provider value={value}>
      {children}
    </OpenAIContext.Provider>
  );
}

export function useOpenAI() {
  const context = useContext(OpenAIContext);

  if (!context) {
    throw new Error("useOpenAI must be used within an OpenAIProvider");
  }

  return context;
}