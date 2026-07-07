import ChatButton from "@/components/buttons/chat-button";
import { MaterialIconButton } from "@/components/buttons/icon-button";
import { useChat, useSystem } from "@/context";
import getMetadata from "@/utilities/metadata";
import { validateMappings } from "@/utilities/mappings";
import { typography } from "@/utilities/typography";
import { randomUUID } from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { addNode, getRootMapping, getRoots } from "message-nodes";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function DrawerContent({ navigation }: { navigation?: { closeDrawer: () => void } }) {
  const { mappings, setMappings, setRoot } = useChat();
  const { colorScheme, systemPrompt } = useSystem();
  
  const loadMappings = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        multiple: true,
      });

      if (result.canceled) return;

      for (const file of result.assets ?? []) {
        try {
          const content = await FileSystem.readAsStringAsync(file.uri);
          const parsed = JSON.parse(content);
          const validMap = validateMappings(parsed);
          setMappings(prev => ({ ...prev, ...validMap }));
        } catch (fileError) {
          console.warn(`Failed to load file: ${file.name}`, fileError);
        }
      }
    } catch (error) {
      console.warn("Failed to load mappings:", error);
    }
  };

  const backupAllChats = async () => {
    const roots = getRoots<string>(mappings);
    if (roots.length === 0) return;

    const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!perms.granted) return;

    for (const root of roots) {
      try {
        const rootMapping = getRootMapping<string>(mappings, root.id);
        const filename = `${root.metadata?.title || "New Chat"}.json`;
        const json = JSON.stringify(rootMapping, null, 2);

        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          perms.directoryUri,
          filename,
          "application/json"
        );

        await FileSystem.writeAsStringAsync(fileUri, json, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } catch (error) {
        console.warn(`Failed to back up chat: ${root.metadata?.title}`, error);
      }
    }
  };

  const createChat = () => {
    const id = randomUUID();
    setMappings((prev) => addNode<string>(
      prev,
      id,
      "system",
      systemPrompt || "You are a helpful assistant.",
      id,
      undefined,
      undefined,
      { title: "New Chat", ...getMetadata() }
    ));
    setRoot(id);
  };
    
  const styles = StyleSheet.create({
    view: {
      flex: 1,
      flexDirection: "column",
    },
    divider: {
      height: 1,
      backgroundColor: colorScheme.outlineVariant,
      marginHorizontal: 28,
      marginVertical: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: 28,
      paddingRight: 12,
      paddingTop: 16,
    },
    controlsText: {
      ...typography.titleSmall,
      color: colorScheme.onSurfaceVariant,
    },
    controls: {
      flexDirection: "row",
      alignItems: "center",
    },
    button: {
      marginHorizontal: 8,
    },
    sessions: {
      flex: 1,
      flexDirection: "column"
    },
  });
    
  return (
    <View testID="drawer-content" style={styles.view}>
      <View style={styles.header}>
        <Text style={styles.controlsText}>Chats</Text>
        <View style={styles.controls}>
          <MaterialIconButton
            testID="load-mappings-button"
            icon="folder-open"
            style={styles.button}
            size={24}
            onPress={loadMappings}
          />
          <MaterialIconButton
            testID="backup-chats-button"
            icon="save-alt"
            style={styles.button}
            size={24}
            onPress={backupAllChats}
          />
          <MaterialIconButton
            testID="new-chat-button"
            icon="add"
            style={styles.button}
            size={24}
            onPress={createChat}
          />
        </View>
      </View>
      <View style={styles.divider} />
      <ScrollView style={styles.sessions}>
        {getRoots<string>(mappings).map((root, index) => <ChatButton testID={`chat-button-${index}`} key={root.id} node={root} />)}
      </ScrollView>
    </View>
  );
}

export default DrawerContent;
