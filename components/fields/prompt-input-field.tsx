import { useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { Dispatch, SetStateAction } from "react";
import { StyleSheet, TextInput } from "react-native";

interface PromptInputFieldProps {
  promptText: string; 
  setPromptText: Dispatch<SetStateAction<string>>;
};

function PromptInputField({ promptText, setPromptText }: PromptInputFieldProps) {
  const { colorScheme } = useSystem();

  const styles = StyleSheet.create({
    input: {
      ...typography.bodyLarge,
      color: colorScheme.onSurface,
      flex: 1,
      maxHeight: 200,
      borderWidth: 0,
      paddingVertical: 0,
      marginHorizontal: 8,
    }
  });

  return (
    <TextInput
      testID="prompt-input"
      style={styles.input}
      placeholder="Type a message..."
      placeholderTextColor={colorScheme.onSurface}
      underlineColorAndroid="transparent"
      multiline
      value={promptText}
      onChangeText={setPromptText}
    />
  );
}

export default PromptInputField;
