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
      marginTop: 40,
    },
    title: {
      color: colorScheme.primary,
      fontSize: 14,
      fontWeight: "bold",
      alignSelf: "flex-start",
      marginBottom: 8,
      marginLeft: 8,
    },
    input: {
      color: colorScheme.onSurface,
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 30,
      fontSize: 16,
      paddingHorizontal: 16,
      width: "100%",
    },
    singleLine: {
      height: 48,
    },
    multiline: {
      minHeight: 96,
      paddingVertical: 12,
      borderRadius: 20,
      textAlignVertical: "top",
    },
  });

  return (
    <View style={styles.view}>
      <Text style={styles.title}>Chat Settings</Text>
      <TextInput
        style={[styles.input, styles.singleLine]}
        placeholder="Username"
        placeholderTextColor={colorScheme.onSurfaceVariant}
        underlineColorAndroid="transparent"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={[styles.input, styles.singleLine]}
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
