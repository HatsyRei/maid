import TextField from "@/components/fields/text-field";
import { useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { StyleSheet, Text, View } from "react-native";

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

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colorScheme.surfaceContainerLow,
      borderRadius: 24,
      padding: 16,
      gap: 16,
      alignItems: "stretch",
    },
    title: {
      ...typography.titleSmall,
      color: colorScheme.primary,
      marginTop: 8,
      marginLeft: 16,
      marginBottom: 12,
    },
  });

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
