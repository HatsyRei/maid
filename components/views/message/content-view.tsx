import { MaterialCommunityIconButton } from "@/components/buttons/icon-button";
import { useChat, useLLM, useSystem } from "@/context";
import getMetadata from "@/utilities/metadata";
import splitReasoning from "@/utilities/reasoning";
import { createStreamWriter } from "@/utilities/stream-writer";
import Markdown from '@novastera-oss/react-native-markdown-display';
import { randomUUID } from "expo-crypto";
import { addNode, branchNode, getConversation, MessageNode, updateContent } from "message-nodes";
import { memo, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableHighlight, View } from "react-native";

function MessageContentView({ message }: { message: MessageNode }) {
  const [ showReasoning, setShowReasoning ] = useState<boolean>(false);
  const [ editText, setEditText ] = useState<string>(message.content);
  const { mappings, setMappings, editing, setEditing } = useChat();
  const { colorScheme } = useSystem();
  const LLM = useLLM();

  const styles = useMemo(() => StyleSheet.create({
    view: {
      flexDirection: "column",
      alignItems: "flex-start",
      width: "100%",
      gap: 8,
    },
    controls: {
      marginTop: 10,
      width: "100%",
      gap: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    showReasoningButton: {
      alignSelf: "center",
    },
    showReasoningButtonText: {
      color: colorScheme.primary,
      fontSize: 14,
    },
    reasoning: {
      color: colorScheme.outline,
      fontSize: 14,
      fontStyle: "italic",
    },
    content: {
      color: colorScheme.onSurface,
      fontSize: 14,
      paddingHorizontal: 0,
    },
  }), [colorScheme]);

  const markdownStyle = useMemo(() => StyleSheet.create({
    body: {
      color: colorScheme.onSurface,
      fontSize: 14,
    },
    link: {
      color: colorScheme.primary,
    },
    code_inline: {
      backgroundColor: colorScheme.surfaceVariant,
      color: colorScheme.onSurface,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: colorScheme.surfaceVariant,
      color: colorScheme.onSurface,
      borderWidth: 0,
      borderRadius: 4,
      padding: 8,
    },
    fence: {
      backgroundColor: colorScheme.surfaceVariant,
      color: colorScheme.onSurface,
      borderWidth: 0,
      borderRadius: 4,
      padding: 8,
    },
    hr: {
      backgroundColor: colorScheme.outline,
      marginVertical: 16,
    }
  }), [colorScheme]);

  const onEdit = () => {
    if (!message.root) {
      Alert.alert("Error", "Cannot edit this message because its conversation root is missing.");
      return;
    }

    if (message.role === "assistant") {
      setMappings(updateContent(mappings, message.id, editText));
      setEditing(undefined);
      return;
    }

    const id = randomUUID();
    let next = branchNode<string>(
      mappings, 
      message.id,
      id,
      editText,
      getMetadata()
    );

    const responseId = randomUUID();
    next = addNode<string>(
      next,
      responseId,
      "assistant",
      "",
      message.root,
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

    try {
      const writer = createStreamWriter(setMappings, responseId);
      LLM.prompt(getConversation(next, message.root), writer.push).finally(writer.flush);
    } catch (error) {
      Alert.alert(
        "Edit failed",
        "There was a problem requesting an updated response. Please try again."
      );
    }

    onEditDone();
  };

  const onEditDone = () => {
    setEditing(undefined);
    setEditText(message.content);
  };

  const [content, reasoning] = splitReasoning(message);

  if (editing === message.id) {
    return (
      <View style={styles.view}>
        <TextInput
          style={styles.content}
          value={editText}
          onChangeText={(text) => setEditText(text)}
          multiline
        />
        <View
          style={styles.controls}
        >
          <MaterialCommunityIconButton
            icon="check"
            onPress={onEdit}
          />
          <MaterialCommunityIconButton
            icon="close"
            onPress={onEditDone}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.view}>
      {reasoning && (
        <TouchableHighlight style={styles.showReasoningButton} onPress={() => setShowReasoning(!showReasoning)}>
          <Text style={styles.showReasoningButtonText}>{showReasoning ? "Hide Reasoning" : "Show Reasoning"}</Text>
        </TouchableHighlight>
      )}
      {reasoning && showReasoning && <Text style={styles.reasoning}>{reasoning}</Text>}
      {content && <Markdown style={markdownStyle}>{content}</Markdown>}
      {message.content.length === 0 && !message.child && (
        LLM.busy ?
          <Text style={styles.reasoning}>...</Text> :
          <Text style={styles.reasoning}>[No content]</Text>
        )
      }
    </View>
  );
};

export default memo(MessageContentView);