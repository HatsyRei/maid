import ChatSettingsGroup from "@/components/groups/chat-settings-group";
import ModelSettingsGroup from "@/components/groups/model-settings-group";
import { useSystem } from "@/context";
import { ScrollView, StyleSheet } from "react-native";

function Settings() {
  const { colorScheme } = useSystem();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.surface,
      paddingVertical: 8,
    },
    content: {
      flexDirection: "column",
      paddingBottom: 16,
    },
  });

  return (
    <ScrollView
      testID="settings-page"
      style={styles.container} 
      contentContainerStyle={styles.content}
    >
      <ModelSettingsGroup />
      <ChatSettingsGroup />
    </ScrollView>
  );
}

export default Settings;