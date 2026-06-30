import { useSystem } from "@/context";
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
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

  const avatars: Record<string, React.ReactNode> = {
    user: <Icon name="account" size={28} color={colorScheme.secondary} />,
    assistant: <Icon name="assistant" size={28} color={colorScheme.secondary} />,
  };

  const role = roleNames[message.role] ?? (message.role.charAt(0).toUpperCase() + message.role.slice(1));
  const profile = avatars[message.role] ?? <Icon name="account-cog" size={28} color={colorScheme.secondary} />;

  return (
    <View style={styles.row}>
      {profile}
      <Text style={[styles.role, { color: colorScheme.secondary }]}>
        {role}
      </Text>
    </View>
  );
}

export default memo(MessageRoleView);