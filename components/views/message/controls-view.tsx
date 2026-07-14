import { MaterialIconButton } from "@/components/buttons/icon-button";
import { useChat, useLLM, useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { getChildren, lastChild, MessageNode, nextChild } from "message-nodes";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

function MessageControlsView({ message }: { message: MessageNode }) {
  const { mappings, setMappings, editing } = useChat();
  const { colorScheme } = useSystem();
  const LLM = useLLM();

  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: "auto",
    },
    counter: {
      ...typography.bodyMedium,
      color: colorScheme.secondary,
      marginHorizontal: 4
    }
  }), [colorScheme]);

  const siblings = getChildren(mappings, message.parent!);
  const index = siblings.findIndex((child) => child.id === message.id);

  if (siblings.length <= 1) {
    return null;
  }

  return (
    <View style={styles.row}>
      <MaterialIconButton
        icon="chevron-left"
        size={26}
        onPress={() => setMappings((prev) => lastChild(prev, message.parent!))}
        disabled={index <= 0 || !!editing || LLM.busy}
        color={colorScheme.secondary}
      />
      <Text
        style={styles.counter}
      >
        {index + 1} / {siblings.length}
      </Text>
      <MaterialIconButton
        icon="chevron-right"
        size={26}
        onPress={() => setMappings((prev) => nextChild(prev, message.parent!))}
        disabled={index === siblings.length - 1 || !!editing || LLM.busy}
        color={colorScheme.secondary}
      />
    </View>
  );
}

export default memo(MessageControlsView);