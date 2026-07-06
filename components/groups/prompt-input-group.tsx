import { useSystem } from "@/context";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import PromptButton from "../buttons/prompt-button";
import PromptInputField from "../fields/prompt-input-field";

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
        inputView: {
          backgroundColor: colorScheme.surfaceVariant,
          borderRadius: 30,
          flexDirection: "row",
          alignItems: "center",
          minHeight: 48,
          paddingVertical: 4,
          paddingHorizontal: 12,
          flex: 1,
        },
      }),
    [colorScheme],
  );

  return (
    <View
      style={styles.root}
    >
      <View style={styles.inputView}>
        <PromptInputField 
          promptText={promptText} 
          setPromptText={setPromptText} 
        />
      </View>
      <PromptButton 
        promptText={promptText} 
        setPromptText={setPromptText} 
      />
    </View>
  );
}

export default PromptInputGroup;
