import { useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

export type AlertButtonStyle = "default" | "cancel" | "destructive";

export interface AlertButton {
  text: string;
  style?: AlertButtonStyle;
  onPress?: () => void;
}

interface AlertDialogViewProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons: AlertButton[];
  onDismiss: () => void;
}

function AlertDialogView({ visible, title, message, buttons, onDismiss }: AlertDialogViewProps) {
  const { colorScheme } = useSystem();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scrim: {
          flex: 1,
          backgroundColor: colorScheme.scrim + "99",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        },
        dialog: {
          width: "100%",
          maxWidth: 360,
          backgroundColor: colorScheme.surfaceVariant,
          borderRadius: 28,
          paddingTop: 24,
          paddingBottom: 18,
          paddingHorizontal: 24,
        },
        title: {
          ...typography.headlineSmall,
          color: colorScheme.onSurface,
        },
        message: {
          ...typography.bodyMedium,
          color: colorScheme.onSurfaceVariant,
          marginTop: 16,
        },
        actions: {
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 8,
          marginTop: 24,
        },
        button: {
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 20,
        },
        buttonText: {
          ...typography.labelLarge,
        },
      }),
    [colorScheme],
  );

  const colorForStyle = (style?: AlertButtonStyle) => {
    if (style === "destructive") return colorScheme.error;
    return colorScheme.secondary;
  };

  return (
    <Modal
      testID="alert-dialog"
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.scrim}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}
              <View style={styles.actions}>
                {buttons.map((button, index) => (
                  <Pressable
                    key={`${button.text}-${index}`}
                    testID={`alert-dialog-button-${index}`}
                    style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
                    onPress={() => {
                      onDismiss();
                      button.onPress?.();
                    }}
                  >
                    <Text style={[styles.buttonText, { color: colorForStyle(button.style) }]}>
                      {button.text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default AlertDialogView;
