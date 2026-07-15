import { useSystem } from "@/context";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleProp, ViewStyle } from "react-native";

interface IconButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  testID?: string;
  size?: number;
  color?: string;
  disabledColor?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onPress: () => void;
}

export function MaterialIconButton(props: IconButtonProps) {
  const { colorScheme } = useSystem();

  const size = props.size ?? 28;
  const iconColor = props.disabled
    ? (props.disabledColor ?? colorScheme.outline)
    : (props.color ?? colorScheme.onSurface);

  // Expand the touch area to the Material 3 minimum (48dp) without changing the
  // visible icon size, so dense layouts (headers, controls) keep their spacing.
  const hit = Math.max((48 - size) / 2, 0);

  return (
    <Pressable
      testID={props.testID}
      style={({ pressed }) => [
        { margin: 4 },
        pressed && !props.disabled && { opacity: 0.7 },
        props.style,
      ]}
      hitSlop={hit}
      android_ripple={{
        color: `${iconColor}33`,
        borderless: true,
        // Reach the edge of the (expanded) touch target so small icons ripple
        // just as visibly as large ones.
        radius: size / 2 + hit,
      }}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <MaterialIcons
        name={props.icon}
        size={size}
        color={iconColor}
      />
    </Pressable>
  );
}