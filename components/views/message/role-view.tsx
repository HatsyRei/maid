import { useSystem } from "@/context";
import { MessageNode } from "message-nodes";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";


function MessageRoleView({ message }: { message: MessageNode }) {
  const { userName, assistantName, colorScheme } = useSystem();

  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    role: {
      color: colorScheme.secondary,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
  }), [colorScheme]);

  const roleNames: Record<string, string | undefined> = {
    user: userName,
    assistant: assistantName,
  };

  const role = roleNames[message.role] ?? (message.role.charAt(0).toUpperCase() + message.role.slice(1));

  return (
    <View style={styles.row}>
      <Text style={[styles.role, { color: colorScheme.secondary }]}>
        {role}
      </Text>
    </View>
  );
}

export default memo(MessageRoleView);