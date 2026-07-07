import { MaterialIconButton } from "@/components/buttons/icon-button";
import { useChat, useLLM, useSystem } from "@/context";
import getMetadata from "@/utilities/metadata";
import { createStreamWriter } from "@/utilities/stream-writer";
import { typography } from "@/utilities/typography";
import { randomUUID } from "expo-crypto";
import { branchNode, getChildren, getConversation, lastChild, MessageNode, nextChild } from "message-nodes";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

function MessageControlsView({ message }: { message: MessageNode }) {
  const { mappings, setMappings, editing, setEditing, setEditInPlace, deleteMessage } = useChat();
  const { colorScheme } = useSystem();
  const LLM = useLLM();

  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    counter: {
      ...typography.bodyMedium,
      color: colorScheme.secondary,
      marginHorizontal: 4
    }
  }), [colorScheme]);

  const onRegenerate = () => {
    const responseId = randomUUID();
    const next = branchNode<string>(
      mappings,
      message.id,
      responseId,
      "",
      {
        ...getMetadata(),
        ...LLM.parameters,
        provider: LLM.type.toLowerCase().replace(" ", "-"),
        model: LLM.model,
      }
    );

    setMappings(next);

    const writer = createStreamWriter(setMappings, responseId);
    LLM.prompt(getConversation(next, message.root!), writer.push).finally(writer.flush);
  };

  const siblings = getChildren(mappings, message.parent!);
  const index = siblings.findIndex((child) => child.id === message.id);

  return (
    <View style={styles.row}>
      {message.role === "assistant" &&
        <MaterialIconButton
          icon="refresh"
          size={26}
          onPress={onRegenerate}
          disabled={!!editing || LLM.busy}
          color={colorScheme.secondary}
        />
      }
      <MaterialIconButton
        icon={message.role === "assistant" ? "edit-note" : "edit"}
        size={26}
        onPress={() => {
          setEditInPlace(false);
          setEditing(message.id);
        }}
        disabled={!!editing || LLM.busy}
        color={colorScheme.secondary}
      />
      {message.role === "user" &&
        <MaterialIconButton
          icon="edit-note"
          size={26}
          onPress={() => {
            setEditInPlace(true);
            setEditing(message.id);
          }}
          disabled={!!editing || LLM.busy}
          color={colorScheme.secondary}
        />
      }
      <MaterialIconButton
        icon="chevron-left"
        size={26}
        onPress={() => setMappings((prev) => lastChild(prev, message.parent!))}
        disabled={index <= 0 || !!editing || LLM.busy}
        color={colorScheme.secondary}
      />
      <Text
        style={styles.counter}
      >
        {index + 1} / {siblings.length}
      </Text>
      <MaterialIconButton
        icon="chevron-right"
        size={26}
        onPress={() => setMappings((prev) => nextChild(prev, message.parent!))}
        disabled={index === siblings.length - 1 || !!editing || LLM.busy}
        color={colorScheme.secondary}
      />
      <MaterialIconButton
        icon="delete"
        size={26}
        onPress={() => deleteMessage(message.id)}
        disabled={!!editing || LLM.busy}
        color={colorScheme.secondary}
      />
    </View>
  );
}

export default memo(MessageControlsView);