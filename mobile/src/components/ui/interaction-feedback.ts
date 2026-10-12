import { LayoutAnimation, Platform, UIManager, type ViewStyle } from 'react-native';

/** Shared visual confirmation while an enabled control is actively pressed. */
export const pressedFeedback: ViewStyle = {
  opacity: 0.72,
  transform: [{ scale: 0.98 }],
};

/** Short transition for local state changes that add, remove, or reorder content. */
export function animateNextLayout() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  LayoutAnimation.configureNext({
    duration: 180,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}
