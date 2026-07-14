import Popover from "@/components/views/popover-view";
import { useChat, useDialog, useLLM, useSystem } from "@/context";
import { createStreamWriter } from "@/utilities/stream-writer";
import { typography } from "@/utilities/typography";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { randomUUID } from "expo-crypto";
import { branchNode, getConversation, MessageNode } from "message-nodes";
import { LayoutRectangle, StyleSheet, Text, TouchableOpacity } from "react-native";

type MenuItem = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

function MessageMenu({
  message,
  anchor,
  visible,
  onClose,
}: {
  message: MessageNode<string>;
  anchor: LayoutRectangle | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { mappings, setMappings, editing, setEditing, setEditInPlace, deleteMessage } = useChat();
  const { colorScheme } = useSystem();
  const { alert } = useDialog();
  const LLM = useLLM();

  const busy = !!editing || LLM.busy;

  const onRegenerate = () => {
    const responseId = randomUUID();
    const next = branchNode<string>(mappings, message.id, responseId, "");

    setMappings(next);

    const writer = createStreamWriter(setMappings, responseId);
    LLM.prompt(getConversation(next, message.root!), writer.push).finally(writer.flush);
  };

  const startEdit = (inPlace: boolean) => {
    setEditInPlace(inPlace);
    setEditing(message.id);
  };

  const copy = () => {
    Clipboard.setStringAsync(message.content);
  };

  const confirmDelete = () => {
    alert(
      "Delete message",
      "Are you sure you want to delete this message? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMessage(message.id) },
      ]
    );
  };

  const items: MenuItem[] =
    message.role === "assistant"
      ? [
          { label: "Regenerate", icon: "refresh", onPress: onRegenerate, disabled: busy },
          { label: "Modify", icon: "edit", onPress: () => startEdit(false), disabled: busy },
          { label: "Copy", icon: "content-copy", onPress: copy },
          { label: "Delete", icon: "delete", onPress: confirmDelete, destructive: true, disabled: busy },
        ]
      : [
          { label: "Revise", icon: "send", onPress: () => startEdit(false), disabled: busy },
          { label: "Modify", icon: "edit", onPress: () => startEdit(true), disabled: busy },
          { label: "Copy", icon: "content-copy", onPress: copy },
          { label: "Delete", icon: "delete", onPress: confirmDelete, destructive: true, disabled: busy },
        ];

  const styles = StyleSheet.create({
    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    label: {
      ...typography.bodyLarge,
      color: colorScheme.onSurface,
    },
    labelDestructive: {
      color: colorScheme.error,
    },
    labelDisabled: {
      color: colorScheme.outline,
    },
  });

  return (
    <Popover
      position="center"
      anchor={anchor}
      width={160}
      visible={visible}
      onClose={onClose}
    >
      {items.map((item) => {
        const color = item.disabled
          ? colorScheme.outline
          : item.destructive
            ? colorScheme.error
            : colorScheme.onSurfaceVariant;

        return (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            disabled={item.disabled}
            onPress={() => {
              onClose();
              item.onPress();
            }}
          >
            <Text
              style={[
                styles.label,
                item.destructive && styles.labelDestructive,
                item.disabled && styles.labelDisabled,
              ]}
            >
              {item.label}
            </Text>
            <MaterialIcons name={item.icon} size={20} color={color} />
          </TouchableOpacity>
        );
      })}
    </Popover>
  );
}

export default MessageMenu;
