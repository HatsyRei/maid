import ChatSettingsGroup from "@/components/groups/chat-settings-group";
import ModelSettingsGroup from "@/components/groups/model-settings-group";
import { useSystem } from "@/context";
import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

function Settings() {
  const { colorScheme } = useSystem();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.surface,
    },
    content: {
      flexDirection: "column",
      padding: 16,
      gap: 16,
    },
  });

  return (
    <KeyboardAwareScrollView
      testID="settings-page"
      style={styles.container}
      contentContainerStyle={styles.content}
      bottomOffset={16}
    >
      <ModelSettingsGroup />
      <ChatSettingsGroup />
    </KeyboardAwareScrollView>
  );
}

export default Settings;