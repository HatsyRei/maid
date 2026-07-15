import { StyleSheet } from "react-native";
import { ColorScheme } from "./color-scheme";
import { typography } from "./typography";

/**
 * Shared Material 3 card + title styles used by the settings groups
 * (chat-settings-group, model-settings-group) so the tonal card container
 * and section heading stay consistent.
 */
export function createSettingsCardStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: colorScheme.surfaceContainerLow,
      borderRadius: 24,
      padding: 16,
      gap: 16,
      alignItems: "stretch",
    },
    title: {
      ...typography.titleSmall,
      color: colorScheme.primary,
      marginTop: 8,
      marginLeft: 16,
      marginBottom: 12,
    },
  });
}
