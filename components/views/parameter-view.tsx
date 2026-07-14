import { MaterialIconButton } from "@/components/buttons/icon-button";
import { useLLM, useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { randomUUID } from "expo-crypto";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

function ParameterView() {
  const { colorScheme } = useSystem();
  const { parameters, setParameters } = useLLM();
  const [keys, setKeys] = useState<string[]>(Object.keys(parameters));

  const styles = StyleSheet.create({
    container: {
      gap: 8,
      paddingTop: 16,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: colorScheme.outlineVariant,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    title: {
      ...typography.titleSmall,
      color: colorScheme.onSurfaceVariant,
      marginLeft: 16,
    },
  });

  const addParameter = () => {
    const newKey = randomUUID();
    setKeys((prev) => [...prev, newKey]);
  }

  const onDelete = (parameterKey: string) => {
    setKeys((prev) => prev.filter((key) => key !== parameterKey));
    setParameters((prev) => {
      const updated = { ...prev };
      delete updated[parameterKey];
      return updated;
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>
          Model Parameters
        </Text>
        <MaterialIconButton
          icon="add"
          size={24}
          color={colorScheme.onSurfaceVariant}
          style={{ margin: 0, padding: 12 }}
          onPress={addParameter}
        />
      </View>
      {keys.map((key) => (
        <ParameterViewItem
          key={key}
          parameterKey={key}
          value={parameters[key]}
          onDelete={() => onDelete(key)}
        />
      ))}
    </View>
  );
}

interface ParameterViewItemProps {
  parameterKey: string;
  value?: string | number | boolean;
  onDelete: () => void;
}

function parseValue(value: string): string | number | boolean {
  let parsedValue: string | number | boolean = value;

  if (value.toLowerCase() === "true") {
    parsedValue = true;
  } else if (value.toLowerCase() === "false") {
    parsedValue = false;
  } else if (value.trim() !== '' && !isNaN(Number(value))) {
    parsedValue = Number(value);
  }

  return parsedValue;
}

function ParameterViewItem(props: ParameterViewItemProps) {
  const { colorScheme } = useSystem();
  const { parameters, setParameters } = useLLM();

  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const initialKey = regex.test(props.parameterKey) ? "" : props.parameterKey;
  const [oldKey, setOldKey] = useState<string>("");
  const [key, setKey] = useState<string>(initialKey);
  const [value, setValue] = useState<string>(String(props.value || parameters[key] || ""));

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 4,
      width: "100%"
    },
    input: {
      ...typography.bodyLarge,
      color: colorScheme.onSurface,
      borderColor: colorScheme.outline,
      borderWidth: 1,
      borderRadius: 8,
      height: 48,
      paddingHorizontal: 16,
      flex: 1,
    }
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (key.trim() === "" || key === oldKey) {
        return;
      }

      const parsedValue = parseValue(value);

      setParameters((prev: Record<string, string | number | boolean>) => {
        const updated = { ...prev };
        delete updated[oldKey];
        return { ...updated, [key]: parsedValue };
      });

      setOldKey(key);
    }, 500);

    return () => clearTimeout(handler);
  }, [key, oldKey, value, setParameters]);

  const updateParameter = (newValue: string) => {
    if (key.trim() === "") return;

    const parsedValue = parseValue(newValue);

    setParameters((prev: Record<string, string | number | boolean>) => ({ ...prev, [key]: parsedValue }));

    setValue(newValue);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Key"
        placeholderTextColor={colorScheme.onSurfaceVariant}
        value={key}
        onChangeText={setKey}
      />
      <TextInput
        style={styles.input}
        placeholder="Value"
        placeholderTextColor={colorScheme.onSurfaceVariant}
        value={value}
        onChangeText={updateParameter}
      />
      <MaterialIconButton
        icon="delete"
        size={24}
        color={colorScheme.onSurfaceVariant}
        style={{ margin: 0, padding: 12 }}
        onPress={props.onDelete}
      />
    </View>
  );
}

export default ParameterView;