import { MaterialIconButton } from "@/components/buttons/icon-button";
import { useChat, useDialog, useLLM, useSystem } from "@/context";
import splitReasoning from "@/utilities/reasoning";
import { createStreamWriter } from "@/utilities/stream-writer";
import { typography } from "@/utilities/typography";
import Markdown from '@novastera-oss/react-native-markdown-display';
import { randomUUID } from "expo-crypto";
import { Image, type ImageLoadEventData } from "expo-image";
import { addNode, branchNode, getConversation, MessageNode, updateContent } from "message-nodes";
import { memo, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// The markdown library's default image style is `{ flex: 1 }` with no height,
// so a bare ![](url) collapses to zero height and never appears. Render images
// through a bounded, auto-sizing expo-image so they stay visible.
function MarkdownImage({ uri }: { uri: string }) {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  const onLoad = (event: ImageLoadEventData) => {
    const { width, height } = event.source;
    if (width && height) setAspectRatio(width / height);
  };

  return (
    <Image
      source={{ uri }}
      style={{ width: "100%", aspectRatio: aspectRatio ?? 16 / 9 }}
      contentFit="contain"
      onLoad={onLoad}
    />
  );
}

function MessageContentView({ message }: { message: MessageNode }) {
  const [ showReasoning, setShowReasoning ] = useState<boolean>(false);
  const [ editText, setEditText ] = useState<string>(message.content);
  const { mappings, setMappings, editing, setEditing, editInPlace, setEditInPlace } = useChat();
  const { colorScheme } = useSystem();
  const { alert } = useDialog();
  const LLM = useLLM();

  // Keep the edit buffer in sync with the message content whenever this message
  // enters edit mode. The initial useState value is captured at mount, when an
  // assistant message is still empty (mid-stream), so without this the edit
  // field would show stale/empty text right after a response finishes.
  useEffect(() => {
    if (editing === message.id) {
      setEditText(message.content);
    }
  }, [editing, message.id, message.content]);

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
      height: 40,
      justifyContent: "center",
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    showReasoningButtonText: {
      ...typography.labelLarge,
      color: colorScheme.primary,
    },
    reasoning: {
      ...typography.bodyMedium,
      color: colorScheme.onSurfaceVariant,
      fontStyle: "italic",
    },
    content: {
      ...typography.bodyMedium,
      color: colorScheme.onSurface,
      paddingHorizontal: 0,
    },
    editInput: {
      ...typography.bodyMedium,
      color: colorScheme.onSurface,
      paddingHorizontal: 0,
      width: "100%",
      minHeight: 48,
      textAlignVertical: "top",
    },
  }), [colorScheme]);

  const markdownStyle = useMemo(() => StyleSheet.create({
    body: {
      ...typography.bodyMedium,
      lineHeight: undefined,
      color: colorScheme.onSurface,
    },
    paragraph: {
      lineHeight: typography.bodyMedium.lineHeight,
    },
    link: {
      color: colorScheme.primary,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colorScheme.primary,
      paddingLeft: 12,
      marginLeft: 8,
      backgroundColor: colorScheme.surfaceContainerHigh,
      color: colorScheme.onSurface,
      borderRadius: 4,
      paddingVertical: 8,
    },
    code_inline: {
      backgroundColor: colorScheme.surfaceContainerHigh,
      color: colorScheme.onSurface,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: colorScheme.surfaceContainerHigh,
      color: colorScheme.onSurface,
      borderWidth: 0,
      borderRadius: 4,
      padding: 8,
    },
    fence: {
      backgroundColor: colorScheme.surfaceContainerHigh,
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
      alert("Error", "Cannot edit this message because its conversation root is missing.");
      return;
    }

    if (message.role === "assistant" || editInPlace) {
      setMappings(updateContent(mappings, message.id, editText));
      onEditDone();
      return;
    }

    const id = randomUUID();
    let next = branchNode<string>(
      mappings, 
      message.id,
      id,
      editText
    );

    const responseId = randomUUID();
    next = addNode<string>(next, responseId, "assistant", "", message.root, id);

    setMappings(next);

    try {
      const writer = createStreamWriter(setMappings, responseId);
      LLM.prompt(getConversation(next, message.root), writer.push).finally(writer.flush);
    } catch (error) {
      alert(
        "Edit failed",
        "There was a problem requesting an updated response. Please try again."
      );
    }

    onEditDone();
  };

  const onEditDone = () => {
    setEditing(undefined);
    setEditInPlace(false);
    setEditText(message.content);
  };

  const [content, reasoning] = splitReasoning(message);

  const markdownRules = useMemo(() => ({
    image: (node: { key: string; attributes: { src?: string } }) => {
      const src = node.attributes?.src;
      if (!src) return null;
      return <MarkdownImage key={node.key} uri={String(src)} />;
    },
  }), []);

  if (editing === message.id) {
    return (
      <View style={styles.view}>
        <TextInput
          style={styles.editInput}
          value={editText}
          onChangeText={(text) => setEditText(text)}
          multiline
          autoFocus
        />
        <View
          style={styles.controls}
        >
          <MaterialIconButton
            icon="check"
            size={26}
            onPress={onEdit}
          />
          <MaterialIconButton
            icon="close"
            size={26}
            onPress={onEditDone}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.view}>
      {reasoning && (
        <Pressable
          style={({ pressed }) => [
            styles.showReasoningButton,
            pressed && { backgroundColor: `${colorScheme.primary}1F` },
          ]}
          onPress={() => setShowReasoning(!showReasoning)}
        >
          <Text style={styles.showReasoningButtonText}>{showReasoning ? "Hide Reasoning" : "Show Reasoning"}</Text>
        </Pressable>
      )}
      {reasoning && showReasoning && <Text style={styles.reasoning}>{reasoning}</Text>}
      {content && <Markdown style={markdownStyle} rules={markdownRules}>{content}</Markdown>}
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
