import FindOpenAIButton from "@/components/buttons/find-open-ai-button";
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
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 16,
      paddingHorizontal: 16
    },
    title: {
      color: colorScheme.onSurface,
      fontSize: 16,
      fontWeight: "bold"
    }
  });

  return (
    <View style={styles.view}>
      <Text style={styles.title}>OAI-compatible Endpoint</Text>
      <FindOpenAIButton />
      <BaseUrlField />
      <ApiKeyField />
      <HeaderView />
      <ParameterView />
    </View>
  );
}

export default ModelSettingsGroup;