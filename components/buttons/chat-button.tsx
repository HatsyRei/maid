import Popover from "@/components/views/popover-view";
import { useChat, useDialog, useSystem } from "@/context";
import { useAnimatedToggle, interpolateColor } from "@/hooks/use-animated-toggle";
import { typography } from "@/utilities/typography";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system";
import { deleteNode, getRootMapping, MessageNode, updateContent } from "message-nodes";
import { useEffect, useState } from "react";
import { Animated, GestureResponderEvent, LayoutRectangle, Pressable, StyleSheet, Text, TextInput } from "react-native";

function ChatButton({ node, testID }: { node: MessageNode<string>, testID?: string }) {
  const { root, setRoot, mappings, setMappings } = useChat();
  const { colorScheme } = useSystem();
  const { alert } = useDialog();
  const [visible, setVisible] = useState<boolean>(false);
  const [rename, setRename] = useState<boolean>(false);
  const [renameEvent, setRenameEvent] = useState<string>("");
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);

  const active = root === node.id;
  const focus = useAnimatedToggle(active, 220);
  const textColor = interpolateColor(focus, colorScheme.onSurfaceVariant, colorScheme.onSecondaryContainer);

  useEffect(() => {
    if (!rename) return;

    const timeout = setTimeout(() => setRename(false), 5000);

    return () => clearTimeout(timeout);
  }, [rename, renameEvent]);

  const open = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    // Anchor a zero-size rect at the touch point so the menu appears where
    // the user long-pressed rather than relative to the whole button row.
    setAnchor({ x: pageX, y: pageY, width: 0, height: 0 });
    setVisible(true);
  };

  const renameChat = (title: string) => {
    setMappings((prev) => updateContent<string, Record<string, any>>(prev, node.id, c => c, m => ({ ...m, title })));
    setRename(false);
  };

  const exportChat = async () => {
    const rootMapping = getRootMapping<string>(mappings, node.id);

    const filename = `${node.metadata?.title || "New Chat"}.json`;

    const json = JSON.stringify(rootMapping, null, 2);

    const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!perms.granted) return;

    const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
      perms.directoryUri,
      filename,
      "application/json"
    );

    await FileSystem.writeAsStringAsync(fileUri, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  }

  const deleteChat = () => {
    if (root === node.id) {
      setRoot(undefined);
    }
    setMappings((prev) => deleteNode(prev, node.id));
  }

  const confirmDeleteChat = () => {
    setVisible(false);
    alert(
      "Delete conversation",
      `Are you sure you want to delete "${node.metadata?.title || "New Chat"}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteChat },
      ]
    );
  }

  const styles = StyleSheet.create({
    view: {
      flexDirection: "column"
    },
    button: {
      minHeight: 48,
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginHorizontal: 12,
      marginVertical: 2,
      borderRadius: 28,
    },
    buttonActive: {
      backgroundColor: colorScheme.secondaryContainer,
    },
    buttonText: {
      ...typography.labelLarge,
      color: colorScheme.onSurfaceVariant,
    },
    buttonTextActive: {
      color: colorScheme.onSecondaryContainer,
    },
    popoverItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    popoverButton: {
      ...typography.bodyLarge,
      color: colorScheme.onSurface,
    },
    popoverButtonDestructive: {
      color: colorScheme.error,
    },
  });
    
  return (
    <>
      {!rename && <Pressable
        testID={testID}
        key={`${node.id}-button`}
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => setRoot(node.id)}
        onLongPress={open}
        delayLongPress={250}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: 28, backgroundColor: colorScheme.secondaryContainer, opacity: focus },
          ]}
          pointerEvents="none"
        />
        <Animated.Text
          style={[styles.buttonText, { color: textColor }]}
          numberOfLines={1}
        >
          {node.metadata?.title || "New Chat"}
        </Animated.Text>
      </Pressable>}
      {rename && <TextInput
        testID={`${testID}-textfield`}
        key={`${node.id}-textfield`}
        style={[
          styles.button,
          styles.buttonText,
          root === node.id ? styles.buttonActive : null,
          root === node.id ? styles.buttonTextActive : null
        ]}
        defaultValue={node.metadata?.title || "New Chat"}
        onChange={(e) => setRenameEvent(e.nativeEvent.text)}
        onEndEditing={(e) => renameChat(e.nativeEvent.text)}
        autoFocus
      />}
      <Popover
        position="center"
        anchor={anchor}
        width={160}
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <Pressable
          testID={`${testID}-rename`}
          style={({ pressed }) => [styles.popoverItem, pressed && { opacity: 0.7 }]}
          onPress={() => {
            setVisible(false);
            setRename(true);
          }}
        >
          <Text style={styles.popoverButton}>Rename</Text>
          <MaterialIcons name="edit" size={20} color={colorScheme.onSurfaceVariant} />
        </Pressable>
        <Pressable
          testID={`${testID}-export`}
          style={({ pressed }) => [styles.popoverItem, pressed && { opacity: 0.7 }]}
          onPress={exportChat}
        >
          <Text style={styles.popoverButton}>Export</Text>
          <MaterialIcons name="file-download" size={20} color={colorScheme.onSurfaceVariant} />
        </Pressable>
        <Pressable
          testID={`${testID}-delete`}
          style={({ pressed }) => [styles.popoverItem, pressed && { opacity: 0.7 }]}
          onPress={confirmDeleteChat}
        >
          <Text style={[styles.popoverButton, styles.popoverButtonDestructive]}>Delete</Text>
          <MaterialIcons name="delete" size={20} color={colorScheme.error} />
        </Pressable>
      </Popover>
    </>
  );
}

export default ChatButton;