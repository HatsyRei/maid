import ApiKeyField from "@/components/fields/api-key-field";
import BaseUrlField from "@/components/fields/base-url-field";
import HeaderView from "@/components/views/header-view";
import ParameterView from "@/components/views/parameter-view";
import { useSystem } from "@/context";
import { StyleSheet, Text, View } from "react-native";

function ModelSettingsGroup() {
  const { colorScheme } = useSystem();

  const styles = StyleSheet.create({
    view: {
      alignItems: "stretch",
      justifyContent: "flex-start",
      gap: 16,
      paddingHorizontal: 16,
      marginTop: 32,
    },
    title: {
      color: colorScheme.primary,
      fontSize: 14,
      fontWeight: "bold",
      marginLeft: 8,
      marginBottom: 8,
    }
  });

  return (
    <View style={styles.view}>
      <Text style={styles.title}>OAI-compatible Endpoint</Text>
      <BaseUrlField />
      <ApiKeyField />
      <HeaderView />
      <ParameterView />
    </View>
  );
}

export default ModelSettingsGroup;