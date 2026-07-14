import { useSystem } from "@/context";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import PromptButton from "../buttons/prompt-button";
import TextField from "../fields/text-field";

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
          marginBottom: 8,
          gap: 8,
        },
        field: {
          flex: 1,
        },
        input: {
          maxHeight: 120,
        },
      }),
    [],
  );

  return (
    <View
      style={styles.root}
    >
      <TextField
        testID="prompt-input"
        label="Message"
        multiline
        value={promptText}
        onChangeText={setPromptText}
        containerStyle={styles.field}
        style={styles.input}
        backgroundColor={colorScheme.surface}
      />
      <PromptButton 
        promptText={promptText} 
        setPromptText={setPromptText} 
      />
    </View>
  );
}

export default PromptInputGroup;
