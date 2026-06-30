import { useSystem } from "@/context";
import { StyleSheet, Text, TextInput, View } from "react-native";

function UserSettingsGroup() {
  const { colorScheme, userName, setUserName } = useSystem();

  const styles = StyleSheet.create({
    view: {
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    title: {
      color: colorScheme.onSurface,
      fontSize: 16,
      fontWeight: "bold"
    },
    input: {
      color: colorScheme.onSurface,
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 30,
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: 300,
    }
  });

  return (
    <View
      style={styles.view}
    >
      <Text style={styles.title}>
        User Settings
      </Text>
      <TextInput
        style={styles.input}
        placeholder="User Name"
        placeholderTextColor={colorScheme.onSurface}
        underlineColorAndroid="transparent"
        value={userName}
        onChangeText={setUserName}
      />
    </View>
  );
}

export default UserSettingsGroup;