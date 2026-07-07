import { MaterialIconButton } from "@/components/buttons/icon-button";
import { useLLM, useSystem } from "@/context";
import { randomUUID } from "expo-crypto";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

function HeaderView() {
  const { colorScheme } = useSystem();
  const { headers, setHeaders } = useLLM();
  const [keys, setKeys] = useState<string[]>(Object.keys(headers || {}));

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 24,
      padding: 16,
      gap: 8,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    title: {
      color: colorScheme.onSurfaceVariant,
      fontSize: 14,
      fontWeight: "bold",
    },
  });

  if (!headers || !setHeaders) return null;

  const addHeader = () => {
    const newKey = randomUUID();
    setKeys((prev) => [...prev, newKey]);
  }

  const onDelete = (headerKey: string) => {
    setKeys((prev) => prev.filter((key) => key !== headerKey));
    setHeaders((prev) => {
      const updated = { ...prev };
      delete updated[headerKey];
      return updated;
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>
          Request Headers
        </Text>
        <MaterialIconButton
          icon="add"
          size={24}
          color={colorScheme.onSurfaceVariant}
          style={{ margin: 0 }}
          onPress={addHeader}
        />
      </View>
      {keys.map((key) => (
        <HeaderViewItem
          key={key}
          headerKey={key}
          value={headers[key]}
          onDelete={() => onDelete(key)}
        />
      ))}
    </View>
  );
}

interface HeaderViewItemProps {
  headerKey: string;
  value?: string;
  onDelete: () => void;
}

function HeaderViewItem(props: HeaderViewItemProps) {
  const { colorScheme } = useSystem();
  const { headers, setHeaders } = useLLM();

  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const initialKey = regex.test(props.headerKey) ? "" : props.headerKey;
  const [oldKey, setOldKey] = useState<string>("");
  const [key, setKey] = useState<string>(initialKey);
  const [value, setValue] = useState<string>(String(props.value || headers?.[key] || ""));

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 4,
      width: "100%"
    },
    input: {
      color: colorScheme.onSurface,
      borderColor: colorScheme.outline,
      borderWidth: 1,
      borderRadius: 8,
      fontSize: 16,
      height: 48,
      paddingHorizontal: 16,
      flex: 1,
    }
  });

  if (!headers || !setHeaders) return null;

  const updateKey = () => {
    if (key.trim() === "" || key === oldKey) return;

    setHeaders((prev: Record<string, string>) => { 
      const updated = { ...prev };
      delete updated[oldKey];
      return { ...updated, [key]: value };
    });

    setOldKey(key);
  }

  useEffect(() => {
    const handler = setTimeout(updateKey, 500);

    return () => clearTimeout(handler);
  }, [key]);

  const updateParameter = (newValue: string) => {
    if (key.trim() === "") return;

    setHeaders((prev: Record<string, string>) => ({ ...prev, [key]: newValue }));

    setValue(newValue);
  }

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
        style={{ margin: 0 }}
        onPress={props.onDelete}
      />
    </View>
  );
}

export default HeaderView;