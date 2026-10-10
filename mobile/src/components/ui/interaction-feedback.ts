import type { ViewStyle } from 'react-native';

/** Shared visual confirmation while an enabled control is actively pressed. */
export const pressedFeedback: ViewStyle = {
  opacity: 0.72,
  transform: [{ scale: 0.98 }],
};
