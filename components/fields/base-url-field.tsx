import { useLLM, useSystem } from "@/context";
import { normalizeBaseUrl, scanForEndpoint, validateEndpoint } from "@/utilities/scan-endpoint";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

function BaseUrlField() {
  const { baseURL, setBaseURL } = useLLM();
  const { colorScheme } = useSystem();
  const [scanning, setScanning] = useState(false);
  const [foundURL, setFoundURL] = useState<string | undefined>(undefined);
  const scanningRef = useRef(false);

  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      width: "100%",
    },
    input: {
      color: colorScheme.onSurface,
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colorScheme.primary + "66",
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flex: 1,
    },
    iconButton: {
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colorScheme.primary + "66",
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  if (!setBaseURL) {
    return null;
  }

  const succeeded = foundURL !== undefined && baseURL === foundURL;

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
        alert("Could not find an OpenAI-compatible endpoint on the local network.");
      }
    } finally {
      scanningRef.current = false;
      setScanning(false);
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Base URL"
        placeholderTextColor={colorScheme.onSurface}
        underlineColorAndroid="transparent"
        value={baseURL}
        onChangeText={setBaseURL}
      />
      <TouchableOpacity
        testID="find-endpoint-button"
        style={[styles.iconButton, { opacity: scanning ? 0.5 : 1 }]}
        onPress={onScan}
        disabled={scanning || succeeded}
      >
        <MaterialIcons
          name={succeeded ? "check" : "search"}
          size={24}
          color={succeeded ? colorScheme.primary : colorScheme.onSurface}
        />
      </TouchableOpacity>
    </View>
  );
}

export default BaseUrlField;