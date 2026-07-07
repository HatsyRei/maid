import { useLLM, useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { StyleSheet, TextInput } from "react-native";

function ApiKeyField() {
  const { apiKey, setApiKey } = useLLM();
  const { colorScheme } = useSystem();

  const styles = StyleSheet.create({
    input: {
      ...typography.bodyLarge,
      color: colorScheme.onSurface,
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 30,
      height: 48,
      paddingHorizontal: 16,
      width: "100%",
    }
  });

  if (!setApiKey) {
    return null;
  }

  return (
    <TextInput
      style={styles.input}
      placeholder="API Key"
      placeholderTextColor={colorScheme.onSurface}
      underlineColorAndroid="transparent"
      value={apiKey}
      onChangeText={setApiKey}
    />
  );
}

export default ApiKeyField;