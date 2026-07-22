import { useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BlurEvent,
  FocusEvent,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Color of the surface the field sits on. Used to mask the outline behind the
   * floating label so it reads as a notch in the border.
   */
  backgroundColor?: string;
}

/**
 * Material 3 outlined text field with a floating label that lifts onto the
 * outline when focused or filled, an outline that highlights on focus, and
 * error state support.
 * https://m3.material.io/components/text-fields/specs
 */
function TextField({
  label,
  error,
  value,
  onFocus,
  onBlur,
  style,
  containerStyle,
  multiline,
  backgroundColor,
  ...rest
}: TextFieldProps) {
  const { colorScheme } = useSystem();
  const [focused, setFocused] = useState(false);

  const floated = focused || (value !== undefined && value !== "");
  const anim = useRef(new Animated.Value(floated ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: floated ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [floated, anim]);

  const accent = error
    ? colorScheme.error
    : focused
      ? colorScheme.primary
      : colorScheme.onSurfaceVariant;

  const borderColor = error
    ? colorScheme.error
    : focused
      ? colorScheme.primary
      : colorScheme.outline;

  const notch = backgroundColor ?? colorScheme.surfaceContainerLow;

  const styles = StyleSheet.create({
    container: {
      borderWidth: focused ? 2 : 1,
      borderColor,
      borderRadius: 8,
      paddingHorizontal: 16,
      minHeight: 56,
      justifyContent: multiline ? "flex-start" : "center",
    },
    input: {
      ...typography.bodyLarge,
      color: colorScheme.onSurface,
      paddingVertical: 16,
      paddingHorizontal: 0,
      margin: 0,
    },
    multiline: {
      textAlignVertical: "top",
    },
  });

  const labelStyle = {
    position: "absolute" as const,
    left: 12,
    paddingHorizontal: 4,
    backgroundColor: floated ? notch : "transparent",
    color: accent,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [16, -8] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    lineHeight: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 16] }),
    letterSpacing: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.4] }),
  };

  const handleFocus = (e: FocusEvent) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: BlurEvent) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.Text style={labelStyle} pointerEvents="none" numberOfLines={1}>
        {label}
      </Animated.Text>
      <TextInput
        {...rest}
        value={value}
        multiline={multiline}
        underlineColorAndroid="transparent"
        style={[styles.input, multiline && styles.multiline, style]}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </View>
  );
}

export default TextField;
