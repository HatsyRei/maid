import { MessageNode } from "message-nodes";

export const LanguageModelTypes = [
  "Open AI",
] as const;

export type LanguageModelType = typeof LanguageModelTypes[number];

interface LanguageModelBaseProps {
  ready: boolean;
  busy: boolean;
  imagesSupported: boolean;
  parameters: Record<string, string | number | boolean>;
  setParameters: React.Dispatch<React.SetStateAction<Record<string, string | number | boolean>>>;
  prompt: (
    messages: Array<MessageNode>, 
    onUpdate: (message: string) => void
  ) => Promise<void>;
  stop: () => Promise<void>
}

interface ModelMixin {
  models: Array<string>;
  model: string | undefined;
  setModel: React.Dispatch<React.SetStateAction<string | undefined>>;
}

interface HeadersMixin {
  headers: Record<string, string>;
  setHeaders: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

interface BaseUrlMixin {
  baseURL: string | undefined;
  setBaseURL: React.Dispatch<React.SetStateAction<string | undefined>>;
  resetBaseURL?: () => void;
}

interface ApiKeyMixin {
  apiKey: string | undefined;
  setApiKey: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export type OpenAIContextProps = LanguageModelBaseProps & ModelMixin & BaseUrlMixin & HeadersMixin & ApiKeyMixin;

export type LanguageModelProps = 
| OpenAIContextProps;

export type LanguageModelContextProps = 
& LanguageModelBaseProps 
& Partial<ModelMixin> 
& Partial<BaseUrlMixin> 
& Partial<ApiKeyMixin>
& Partial<HeadersMixin>
& {
  type: LanguageModelType;
}