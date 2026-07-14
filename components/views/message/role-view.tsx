import { useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { MessageNode } from "message-nodes";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";


function MessageRoleView({ message }: { message: MessageNode }) {
  const { userName, assistantName, colorScheme } = useSystem();

  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    role: {
      ...typography.titleMedium,
      color: colorScheme.primary,
    },
  }), [colorScheme]);

  const roleNames: Record<string, string | undefined> = {
    user: userName,
    assistant: assistantName,
  };

  const role = roleNames[message.role] ?? (message.role.charAt(0).toUpperCase() + message.role.slice(1));

  return (
    <View style={styles.row}>
      <Text style={[styles.role, { color: colorScheme.primary }]}>
        {role}
      </Text>
    </View>
  );
}

export default memo(MessageRoleView);