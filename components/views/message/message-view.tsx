import MessageContentView from "@/components/views/message/content-view";
import MessageControlsView from "@/components/views/message/controls-view";
import MessageRoleView from "@/components/views/message/role-view";
import { MessageNode } from "message-nodes";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  view: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginVertical: 12,
    marginHorizontal: 4,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    width: "100%",
    rowGap: 8,
    marginBottom: 8,
  },
});

function MessageView({ message }: { message: MessageNode }) {
  return (
    <View style={styles.view}>
      <View style={styles.headerRow}>
        <MessageRoleView message={message} />
        <MessageControlsView message={message} />
      </View>
      <MessageContentView message={message} />
    </View>
  );
}

export default memo(MessageView);
