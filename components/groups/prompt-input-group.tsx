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
          flexDirection: "column",
          alignItems: "center",
        },
        inputView: {
          backgroundColor: colorScheme.surfaceVariant,
          borderRadius: 30,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 4,
          paddingHorizontal: 12,
          marginTop: 16,
          marginBottom: 8,
          alignSelf: "stretch",
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
        <PromptButton 
          promptText={promptText} 
          setPromptText={setPromptText} 
        />
      </View>
    </View>
  );
}

export default PromptInputGroup;
