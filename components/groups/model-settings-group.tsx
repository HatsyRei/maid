import ApiKeyField from "@/components/fields/api-key-field";
import BaseUrlField from "@/components/fields/base-url-field";
import HeaderView from "@/components/views/header-view";
import ParameterView from "@/components/views/parameter-view";
import { useSystem } from "@/context";
import { createSettingsCardStyles } from "@/utilities/settings-styles";
import { Text, View } from "react-native";

function ModelSettingsGroup() {
  const { colorScheme } = useSystem();

  const styles = createSettingsCardStyles(colorScheme);

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