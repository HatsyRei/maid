import { useEffect, useRef } from "react";
import { Animated } from "react-native";

/**
 * Drives an Animated progress value between 0 and 1 whenever `active` flips,
 * giving a smooth cross-state transition that can be shared across UI elements
 * (e.g. enabled/disabled buttons, focused/unfocused pills).
 *
 * useNativeDriver is false so the progress can feed colour and layout
 * interpolations, which the native driver does not support.
 */
export function useAnimatedToggle(active: boolean, duration = 150) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, [active, duration, progress]);

  return progress;
}

/** Interpolate an animated 0→1 progress between two colours. */
export function interpolateColor(
  progress: Animated.Value,
  from: string,
  to: string,
) {
  return progress.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
}

export default useAnimatedToggle;
