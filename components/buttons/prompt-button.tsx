import { useChat, useLLM, useSystem } from "@/context";
import { useAnimatedToggle, interpolateColor } from "@/hooks/use-animated-toggle";
import { createStreamWriter } from "@/utilities/stream-writer";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { randomUUID } from "expo-crypto";
import { addNode, getConversation } from "message-nodes";
import { Dispatch, SetStateAction } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

interface PromptButtonProps {
  promptText: string; 
  setPromptText: Dispatch<SetStateAction<string>>;
};

function PromptButton({ promptText, setPromptText }: PromptButtonProps) {
  const { mappings, setMappings, root, setRoot } = useChat();
  const { colorScheme, systemPrompt } = useSystem();
  const LLM = useLLM();

  const busy = LLM.ready && LLM.busy;
  const sendDisabled = !LLM.ready || promptText.trim().length === 0;

  // `filled` = the button wears its active palette (white fill, dark icon):
  // true while streaming (stop) or when a message is ready to send.
  const fill = useAnimatedToggle(busy || !sendDisabled);
  const busyProgress = useAnimatedToggle(busy);

  const backgroundColor = interpolateColor(fill, colorScheme.surfaceContainerHigh, "#FFFFFF");
  const inverseFill = fill.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const inverseBusy = busyProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  const prompt = () => {
    if (!LLM.ready) return;

    let next = mappings;
    let parent: string | undefined;

    if (root) {
      const thread = getConversation(mappings, root);
      parent = thread[thread.length - 1].id;
    } else {
      parent = randomUUID();
      next = addNode<string>(
        next,
        parent,
        "system",
        systemPrompt || "You are a helpful assistant.",
        parent,
        undefined,
        undefined,
        { title: "New Chat" }
      );
    }

    const id = randomUUID();
    next = addNode<string>(next, id, "user", promptText, root || parent, parent);
    setPromptText("");

    const responseId = randomUUID();
    next = addNode<string>(next, responseId, "assistant", "", root || parent, id);

    setMappings(next);
    setRoot(root || parent);

    const conversation = getConversation(next, root || parent);

    const writer = createStreamWriter(setMappings, responseId);
    LLM.prompt(conversation, writer.push).finally(writer.flush);
  };

  const disabled = !busy && sendDisabled;

  return (
    <Pressable
      testID={busy ? "stop-button" : "send-button"}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: pressed && !disabled ? 0.7 : 1,
      })}
      onPress={busy ? LLM.stop : prompt}
    >
      <Animated.View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Enabled send arrow (dark) */}
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.center, { opacity: Animated.multiply(fill, inverseBusy) }]}
        >
          <MaterialIcons name="arrow-upward" size={24} color="#000000" />
        </Animated.View>
        {/* Disabled send arrow (muted) */}
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.center, { opacity: Animated.multiply(inverseFill, inverseBusy) }]}
        >
          <MaterialIcons name="arrow-upward" size={24} color={colorScheme.onSurfaceVariant} />
        </Animated.View>
        {/* Streaming stop icon (dark) */}
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.center, { opacity: busyProgress }]}
        >
          <MaterialIcons name="stop" size={24} color="#000000" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PromptButton;