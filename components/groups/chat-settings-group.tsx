import TextField from "@/components/fields/text-field";
import { useSystem } from "@/context";
import { createSettingsCardStyles } from "@/utilities/settings-styles";
import { Text, View } from "react-native";

function ChatSettingsGroup() {
  const {
    colorScheme,
    userName,
    setUserName,
    assistantName,
    setAssistantName,
    systemPrompt,
    setSystemPrompt,
  } = useSystem();

  const styles = createSettingsCardStyles(colorScheme);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Chat Settings</Text>
      <TextField
        label="Username"
        value={userName}
        onChangeText={setUserName}
      />
      <TextField
        label="Assistant name"
        value={assistantName}
        onChangeText={setAssistantName}
      />
      <TextField
        label="System Prompt"
        value={systemPrompt}
        onChangeText={setSystemPrompt}
        containerStyle={{ minHeight: 112 }}
        multiline
      />
    </View>
  );
}

export default ChatSettingsGroup;
