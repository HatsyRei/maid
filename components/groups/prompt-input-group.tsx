import { useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import PromptButton from "../buttons/prompt-button";

function PromptInputGroup() {
  const { colorScheme } = useSystem();

  const [promptText, setPromptText] = useState<string>("");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flexDirection: "row",
          alignItems: "flex-end",
          marginTop: 16,
          marginBottom: 16,
          paddingLeft: 20,
          paddingRight: 6,
          paddingVertical: 6,
          borderRadius: 30,
          backgroundColor: colorScheme.surfaceContainerHigh,
        },
        input: {
          ...typography.bodyLarge,
          flex: 1,
          color: colorScheme.onSurface,
          paddingVertical: 12,
          paddingHorizontal: 0,
          margin: 0,
          minHeight: 44,
          maxHeight: 120,
          textAlignVertical: "top",
        },
      }),
    [colorScheme],
  );

  return (
    <View
      style={styles.root}
    >
      <TextInput
        testID="prompt-input"
        placeholder="Message"
        placeholderTextColor={colorScheme.onSurfaceVariant}
        multiline
        value={promptText}
        onChangeText={setPromptText}
        underlineColorAndroid="transparent"
        style={styles.input}
      />
      <PromptButton 
        promptText={promptText} 
        setPromptText={setPromptText} 
      />
    </View>
  );
}

export default PromptInputGroup;
