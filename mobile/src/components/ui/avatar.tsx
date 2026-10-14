import { Image } from 'expo-image';
import { View } from 'react-native';

import { AppText } from './app-text';
import { avatarSizes, identityStyles as styles, type AvatarProps } from './identity-shared';

export function Avatar({
  accessibilityLabel,
  initials,
  size = 'small',
  source,
  style,
  testID,
  ...viewProps
}: AvatarProps) {
  const dimension = avatarSizes[size];

  return <View
    {...viewProps}
    testID={testID}
    accessible
    accessibilityLabel={accessibilityLabel ?? `${initials} avatar`}
    accessibilityRole="image"
    style={[style, styles.avatar, { width: dimension, height: dimension }]}
  >
    {source ? <Image
      testID={testID ? `${testID}-image` : undefined}
      source={source}
      contentFit="cover"
      accessible={false}
      style={styles.avatarImage}
    /> : <AppText
      testID={testID ? `${testID}-initials` : undefined}
      variant={size === 'large' ? 'h5' : 'caption'}
    >
      {initials}
    </AppText>}
  </View>;
}
