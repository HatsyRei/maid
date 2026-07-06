import { MaterialIconButton } from "@/components/buttons/icon-button";
import { useChat, useLLM, useSystem } from "@/context";
import getMetadata from "@/utilities/metadata";
import { createStreamWriter } from "@/utilities/stream-writer";
import { randomUUID } from "expo-crypto";
import { addNode, getConversation } from "message-nodes";
import { Dispatch, SetStateAction } from "react";

interface PromptButtonProps {
  promptText: string; 
  setPromptText: Dispatch<SetStateAction<string>>;
};

function PromptButton({ promptText, setPromptText }: PromptButtonProps) {
  const { mappings, setMappings, root, setRoot } = useChat();
  const { colorScheme, systemPrompt } = useSystem();
  const LLM = useLLM();

  const prompt = () => {
    if (!LLM.ready) return;

    let next = mappings;
    let parent: string | undefined;

    if (root) {
      const thread = getConversation(mappings, root);
      parent = thread[thread.length - 1].id;
    } else {
      parent = randomUUID();
      next = addNode<string>(
        next,
        parent,
        "system",
        systemPrompt || "You are a helpful assistant.",
        parent,
        undefined,
        undefined,
        { title: "New Chat", ...getMetadata() }
      );
    }

    const id = randomUUID();
    next = addNode<string>(next, id, "user", promptText, root || parent, parent, undefined, getMetadata());
    setPromptText("");

    const responseId = randomUUID();
    next = addNode<string>(
      next,
      responseId,
      "assistant",
      "",
      root || parent,
      id,
      undefined,
      {
        ...getMetadata(),
        ...LLM.parameters,
        provider: LLM.type.toLowerCase().replace(" ", "-"),
        model: LLM.model,
      }
    );

    setMappings(next);
    setRoot(root || parent);

    const conversation = getConversation(next, root || parent);

    const writer = createStreamWriter(setMappings, responseId);
    LLM.prompt(conversation, writer.push).finally(writer.flush);
  };

  if (LLM.ready && LLM.busy) {
    return (
      <MaterialIconButton
        testID="stop-button"
        icon="stop"
        size={22}
        color={colorScheme.onPrimary}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colorScheme.primary,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={LLM.stop}
      />
    );
  }

  const disabled = !LLM.ready || promptText.trim().length === 0;

  return (
    <MaterialIconButton
      testID="send-button"
      icon="send"
      size={22}
      color={colorScheme.onPrimary}
      disabledColor={colorScheme.onSurfaceVariant}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: disabled ? colorScheme.surfaceVariant : colorScheme.primary,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={prompt}
      disabled={disabled}
    />
  );
}

export default PromptButton;