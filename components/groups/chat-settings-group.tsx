import { useSystem } from "@/context";
import { StyleSheet, Text, TextInput, View } from "react-native";

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
    view: {
      alignItems: "stretch",
      gap: 12,
      paddingHorizontal: 16,
      marginTop: 24,
    },
    title: {
      color: colorScheme.onSurface,
      fontSize: 16,
      fontWeight: "bold",
      alignSelf: "center",
      marginBottom: 4,
    },
    input: {
      color: colorScheme.onSurface,
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 30,
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: "100%",
    },
    multiline: {
      minHeight: 96,
      borderRadius: 20,
      textAlignVertical: "top",
    },
  });

  return (
    <View style={styles.view}>
      <Text style={styles.title}>Chat Settings</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={colorScheme.onSurfaceVariant}
        underlineColorAndroid="transparent"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Assistant name"
        placeholderTextColor={colorScheme.onSurfaceVariant}
        underlineColorAndroid="transparent"
        value={assistantName}
        onChangeText={setAssistantName}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="System Prompt"
        placeholderTextColor={colorScheme.onSurfaceVariant}
        underlineColorAndroid="transparent"
        value={systemPrompt}
        onChangeText={setSystemPrompt}
        multiline
      />
    </View>
  );
}

export default ChatSettingsGroup;
