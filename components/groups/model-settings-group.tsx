import ApiKeyField from "@/components/fields/api-key-field";
import BaseUrlField from "@/components/fields/base-url-field";
import HeaderView from "@/components/views/header-view";
import ParameterView from "@/components/views/parameter-view";
import { useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { StyleSheet, Text, View } from "react-native";

function ModelSettingsGroup() {
  const { colorScheme } = useSystem();

  const styles = StyleSheet.create({
    card: {
      alignItems: "stretch",
      justifyContent: "flex-start",
      gap: 16,
      backgroundColor: colorScheme.surfaceContainerLow,
      borderRadius: 24,
      padding: 16,
    },
    title: {
      ...typography.titleSmall,
      color: colorScheme.primary,
      marginTop: 8,
      marginLeft: 16,
      marginBottom: 12,
    }
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Endpoint Settings</Text>
      <BaseUrlField />
      <ApiKeyField />
      <HeaderView />
      <ParameterView />
    </View>
  );
}

export default ModelSettingsGroup;