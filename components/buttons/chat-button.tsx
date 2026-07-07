import Popover from "@/components/views/popover-view";
import { useChat, useDialog, useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system";
import { deleteNode, getRootMapping, MessageNode, updateContent } from "message-nodes";
import { useEffect, useRef, useState } from "react";
import { LayoutRectangle, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

function ChatButton({ node, testID }: { node: MessageNode<string>, testID?: string }) {
  const { root, setRoot, mappings, setMappings } = useChat();
  const { colorScheme } = useSystem();
  const { alert } = useDialog();
  const [visible, setVisible] = useState<boolean>(false);
  const [rename, setRename] = useState<boolean>(false);
  const [renameEvent, setRenameEvent] = useState<string>("");
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const anchorRef = useRef<Text>(null);

  useEffect(() => {
    if (!rename) return;

    const timeout = setTimeout(() => setRename(false), 5000);

    return () => clearTimeout(timeout);
  }, [rename, renameEvent]);

  const open = () => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setVisible(true);
    });
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
      gap: 20,
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
      {!rename && <TouchableOpacity
        testID={testID}
        key={`${node.id}-button`}
        style={[
          styles.button,
          root === node.id ? styles.buttonActive : null
        ]}
        onPress={() => setRoot(node.id)}
        onLongPress={open}
      >
        <Text
          ref={anchorRef}
          style={[
            styles.buttonText,
            root === node.id ? styles.buttonTextActive : null
          ]}
          numberOfLines={1}
        >
          {node.metadata?.title || "New Chat"}
        </Text>
      </TouchableOpacity>}
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
        position="bottom"
        anchor={anchor}
        offset={{ y: (anchor?.height ?? 0) }}
        width={220}
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <TouchableOpacity
          testID={`${testID}-rename`}
          style={styles.popoverItem}
          onPress={() => {
            setVisible(false);
            setRename(true);
          }}
        >
          <Text style={styles.popoverButton}>Rename</Text>
          <MaterialIcons name="edit" size={20} color={colorScheme.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity
          testID={`${testID}-export`}
          style={styles.popoverItem}
          onPress={exportChat}
        >
          <Text style={styles.popoverButton}>Export</Text>
          <MaterialIcons name="file-download" size={20} color={colorScheme.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity
          testID={`${testID}-delete`}
          style={styles.popoverItem}
          onPress={confirmDeleteChat}
        >
          <Text style={[styles.popoverButton, styles.popoverButtonDestructive]}>Delete</Text>
          <MaterialIcons name="delete" size={20} color={colorScheme.error} />
        </TouchableOpacity>
      </Popover>
    </>
  );
}

export default ChatButton;