import { useLLM, useDialog, useSystem } from "@/context";
import { normalizeBaseUrl, scanForEndpoint, validateEndpoint } from "@/utilities/scan-endpoint";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

function BaseUrlField() {
  const { baseURL, setBaseURL } = useLLM();
  const { colorScheme } = useSystem();
  const { alert } = useDialog();
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
      fontSize: 16,
      height: 48,
      paddingHorizontal: 16,
      flex: 1,
    },
    iconButton: {
      backgroundColor: colorScheme.primary,
      borderRadius: 24,
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
        style={[
          styles.iconButton,
          { backgroundColor: disabled ? colorScheme.surfaceVariant : colorScheme.primary },
        ]}
        onPress={onScan}
        disabled={disabled}
      >
        <MaterialIcons
          name={succeeded ? "check" : "search"}
          size={24}
          color={disabled ? colorScheme.onSurfaceVariant : colorScheme.onPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default BaseUrlField;