import Dropdown from "@/components/dropdowns/dropdown";
import { useLLM, useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { StyleSheet, Text, View } from "react-native";

function ModelDropdown({ small }: { small?: boolean }) {
  const { type, models, model, setModel } = useLLM();
  const { colorScheme } = useSystem();

  if (!models || models.length === 0 || !setModel) {
    return null;
  }

  const items = models!.map((model) => {
    return {
      label: model,
      value: model
    }
  });

  if (small) {
    return (
      <View style={{ marginLeft: 20, flexShrink: 1 }}>
        <Dropdown
          items={items}
          selectedValue={model ?? "Select Model"}
          onValueChange={setModel!}
        />
      </View>
    );
  }

  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    title: {
      ...typography.titleMedium,
      color: colorScheme.onSurface,
    }
  });
  
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{type} Model</Text>
      <Dropdown
        items={items}
        selectedValue={model ?? "Select Model"}
        onValueChange={setModel!}
      />
    </View>
  );
}

export default ModelDropdown;