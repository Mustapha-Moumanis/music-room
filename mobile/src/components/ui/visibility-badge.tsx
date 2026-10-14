import { Badge, visibilityBackgrounds, visibilityLabels, type VisibilityBadgeProps } from './identity-shared';

export function VisibilityBadge({
  style,
  testID,
  type = 'public',
  ...viewProps
}: VisibilityBadgeProps) {
  const label = visibilityLabels[type];

  return <Badge
    {...viewProps}
    testID={testID}
    accessibilityLabel={`Visibility: ${label}`}
    backgroundColor={visibilityBackgrounds[type]}
    onAccent={type === 'public'}
    style={style}
  >
    {label}
  </Badge>;
}
