import MessageContentView from "@/components/views/message/content-view";
import MessageControlsView from "@/components/views/message/controls-view";
import MessageMenu from "@/components/views/message/message-menu";
import MessageRoleView from "@/components/views/message/role-view";
import { useSystem } from "@/context";
import { MessageNode } from "message-nodes";
import { memo, useMemo, useState } from "react";
import { GestureResponderEvent, LayoutRectangle, Pressable, StyleSheet, View } from "react-native";

function MessageView({ message }: { message: MessageNode }) {
  const { colorScheme } = useSystem();
  const [visible, setVisible] = useState<boolean>(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);

  const styles = useMemo(() => StyleSheet.create({
    view: {
      flexDirection: "column",
      alignItems: "flex-start",
      marginVertical: 4,
      marginHorizontal: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    // Material 3 pressed state layer: onSurface at ~10% opacity laid over the
    // container while the finger is down, so a long-press registers visually
    // the moment it starts rather than only when the menu appears.
    pressed: {
      backgroundColor: `${colorScheme.onSurface}1A`,
    },
    headerRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      width: "100%",
      rowGap: 8,
      marginBottom: 8,
    },
  }), [colorScheme]);

  const open = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    // Anchor a zero-size rect at the touch point so the menu appears where the
    // user long-pressed rather than relative to the whole message.
    setAnchor({ x: pageX, y: pageY, width: 0, height: 0 });
    setVisible(true);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.view, pressed && styles.pressed]}
      onLongPress={open}
      unstable_pressDelay={80}
    >
      <View style={styles.headerRow}>
        <MessageRoleView message={message} />
        <MessageControlsView message={message} />
      </View>
      <MessageContentView message={message} />
      <MessageMenu
        message={message}
        anchor={anchor}
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </Pressable>
  );
}

export default memo(MessageView);
