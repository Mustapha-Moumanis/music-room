import { Badge, licenseBackgrounds, licenseLabels, type LicenseBadgeProps } from './identity-shared';

export function LicenseBadge({
  style,
  testID,
  type = 'invite',
  ...viewProps
}: LicenseBadgeProps) {
  const label = licenseLabels[type];

  return <Badge
    {...viewProps}
    testID={testID}
    accessibilityLabel={`Restriction: ${label}`}
    backgroundColor={licenseBackgrounds[type]}
    onAccent={type === 'location' || type === 'time'}
    style={style}
  >
    {label}
  </Badge>;
}
