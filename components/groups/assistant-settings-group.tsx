import { useSystem } from "@/context";
import { StyleSheet, Text, TextInput, View } from "react-native";

function AssistantSettingsGroup() {
  const { colorScheme, assistantName, setAssistantName } = useSystem();

  const styles = StyleSheet.create({
    view: {
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    title: {
      color: colorScheme.onSurface,
      fontSize: 16,
      fontWeight: "bold"
    },
    input: {
      color: colorScheme.onSurface,
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 30,
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: 300,
    }
  });

  return (
    <View
      style={styles.view}
    >
      <Text style={styles.title}>
        Assistant Settings
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Assistant Name"
        placeholderTextColor={colorScheme.onSurface}
        underlineColorAndroid="transparent"
        value={assistantName}
        onChangeText={setAssistantName}
      />
    </View>
  );
}

export default AssistantSettingsGroup;