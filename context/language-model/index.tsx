// The app targets OpenAI-compatible endpoints only, so the language-model layer
// is a thin alias over the OpenAI provider. `useLLM`/`LanguageModelProvider` are
// kept as the public names so call sites stay backend-agnostic.
export { OpenAIProvider as LanguageModelProvider, useOpenAI as useLLM } from "./open-ai";
export type { OpenAIContextProps as LanguageModelContextProps } from "./types";
