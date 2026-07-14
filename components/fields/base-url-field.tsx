import TextField from "@/components/fields/text-field";
import { useLLM, useDialog, useSystem } from "@/context";
import { normalizeBaseUrl, scanForEndpoint, validateEndpoint } from "@/utilities/scan-endpoint";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

function BaseUrlField() {
  const { baseURL, setBaseURL } = useLLM();
  const { colorScheme } = useSystem();
  const { alert } = useDialog();
  const [scanning, setScanning] = useState(false);
  const [foundURL, setFoundURL] = useState<string | undefined>(undefined);
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>({ start: 0, end: 0 });
  const scanningRef = useRef(false);

  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      width: "100%",
    },
    iconButton: {
      backgroundColor: colorScheme.secondaryContainer,
      borderRadius: 28,
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  if (!setBaseURL) {
    return null;
  }

  const succeeded = foundURL !== undefined && baseURL === foundURL;
  const disabled = scanning || succeeded;

  const onScan = async () => {
    if (scanningRef.current || succeeded) return;
    scanningRef.current = true;
    setScanning(true);
    try {
      // When a well-formed base URL is already present, validate it instead of
      // scanning the entire subnet. This avoids an expensive scan when a good
      // address exists.
      const normalized = normalizeBaseUrl(baseURL ?? "");
      if (normalized && await validateEndpoint(normalized)) {
        setBaseURL(normalized);
        setFoundURL(normalized);
        return;
      }

      const found = await scanForEndpoint();
      if (found) {
        setBaseURL(found);
        setFoundURL(found);
      } else {
        alert("No endpoint found", "Could not find an OpenAI-compatible endpoint on the local network.");
      }
    } finally {
      scanningRef.current = false;
      setScanning(false);
    }
  };

  return (
    <View style={styles.row}>
      <TextField
        label="Base URL"
        containerStyle={{ flex: 1 }}
        value={baseURL}
        onChangeText={setBaseURL}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        selection={selection}
        onFocus={() => setSelection(undefined)}
        onBlur={() => setSelection({ start: 0, end: 0 })}
      />
      <Pressable
        testID="find-endpoint-button"
        style={[
          styles.iconButton,
          disabled && { backgroundColor: `${colorScheme.onSurface}1F` },
        ]}
        onPress={onScan}
        disabled={disabled}
        android_ripple={{ color: colorScheme.onSecondaryContainer, borderless: true }}
      >
        <MaterialIcons
          name={succeeded ? "check" : "search"}
          size={24}
          color={disabled ? `${colorScheme.onSurface}61` : colorScheme.onSecondaryContainer}
        />
      </Pressable>
    </View>
  );
}

export default BaseUrlField;