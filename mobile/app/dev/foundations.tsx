import { MoreVerticalIcon, PlayIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { Redirect } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIcon, AppScreen, AppText, type AppIconData } from '../../src/components/ui';
import { isDevBuild } from '../../src/config/variant';
import {
  colors,
  grid,
  iconMetrics,
  layout,
  palette,
  radius,
  shadows,
  spacing,
  type SemanticColorRole,
  type TypographyVariant,
} from '../../src/theme';

const primitiveSwatches: Array<{ label: string; value: string; color: string; textColor?: SemanticColorRole }> = [
  { label: 'Teal', value: palette.teal, color: palette.teal, textColor: 'text.onAccent' },
  { label: 'Coral Orange', value: palette.coral, color: palette.coral, textColor: 'text.onAccent' },
  { label: 'Deep Black', value: palette.deepBlack, color: palette.deepBlack },
  { label: 'Surface', value: palette.surface, color: palette.surface },
  { label: 'Warm Cream', value: palette.warmCream, color: palette.warmCream, textColor: 'text.onAccent' },
  { label: 'Muted Purple', value: palette.mutedPurple, color: palette.mutedPurple },
  { label: 'Neutral 500', value: palette.neutral500, color: palette.neutral500, textColor: 'text.onAccent' },
  { label: 'Neutral 300', value: palette.neutral300, color: palette.neutral300, textColor: 'text.onAccent' },
  { label: 'Neutral 200', value: palette.neutral200, color: palette.neutral200, textColor: 'text.onAccent' },
];

const semanticSwatches = [
  ['background.app', colors.background.app],
  ['background.surface', colors.background.surface],
  ['background.selected', colors.background.selected],
  ['text.primary', colors.text.primary],
  ['text.secondary', colors.text.secondary],
  ['text.muted', colors.text.muted],
  ['text.onAccent', colors.text.onAccent],
  ['action.primary', colors.action.primary],
  ['action.secondary', colors.action.secondary],
  ['category.secondary', colors.category.secondary],
  ['border.subtle', colors.border.subtle],
  ['player.progress', colors.player.progress],
  ['player.secondary', colors.player.secondary],
] as const;

const typeSpecimens: Array<{ variant: TypographyVariant; label: string; copy: string }> = [
  { variant: 'display', label: 'Display · 64 / 67.2', copy: 'Old sounds. New feelings.' },
  { variant: 'h1', label: 'H1 · 48 / 52.8', copy: 'Music that feels collected, not generated.' },
  { variant: 'h2', label: 'H2 · 36 / 41.4', copy: 'Find something worth listening to.' },
  { variant: 'h3', label: 'H3 · 28 / 33.6', copy: 'Your Daily Mix' },
  { variant: 'h4', label: 'H4 · 22 / 27.5', copy: 'Recently played' },
  { variant: 'h5', label: 'H5 · 18 / 23.4', copy: 'Listening together' },
  { variant: 'bodyLarge', label: 'Body Large · 18 / 27.9', copy: 'A room for the music and people you care about.' },
  { variant: 'body', label: 'Body · 16 / 24', copy: 'A restrained, tactile interface for shared listening.' },
  { variant: 'bodySmall', label: 'Body Small · 14 / 20.3', copy: 'Keep hierarchy clear and color intentional.' },
  { variant: 'navigationLabel', label: 'Navigation Label · 14 / 20', copy: 'Home  Search  Profile' },
  { variant: 'buttonLabel', label: 'Button Label · 14 / 20', copy: 'Create a room' },
  { variant: 'caption', label: 'Caption · 12 / 16.8', copy: 'EXPLICIT · 3:42' },
];

const radiusSpecimens = [
  ['Small control', radius.small],
  ['Button / input', radius.medium],
  ['Card', radius.card],
  ['Media', radius.media],
  ['Pill', radius.full],
] as const;

const useRules = [
  'Large music imagery',
  'Warm cream against deep black',
  'Coral for primary actions',
  'Teal for secondary interaction',
  'Subtle grain only on media',
  'Strong but controlled typography',
];

const avoidRules = [
  'Generic Spotify layouts',
  'Neon / cyberpunk treatment',
  'Heavy glassmorphism',
  'Textures on every surface',
  'Excessive rounded cards',
  'Decorative uppercase everywhere',
];

function Section({ number, title, description, children }: PropsWithChildren<{ number: string; title: string; description: string }>) {
  return <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <AppText variant="h3">{number}. {title}</AppText>
      <AppText variant="bodySmall" color="text.secondary">{description}</AppText>
    </View>
    {children}
  </View>;
}

function RuleList({ title, items, accent }: { title: string; items: string[]; accent: 'primary' | 'secondary' }) {
  const dotColor = accent === 'primary' ? colors.action.primary : colors.action.secondary;
  return <View style={styles.ruleColumn}>
    <AppText variant="h5" color={accent === 'primary' ? 'action.primary' : 'action.secondary'}>{title}</AppText>
    {items.map((item) => <View key={item} style={styles.ruleRow}>
      <View style={[styles.ruleDot, { backgroundColor: dotColor }]} />
      <AppText variant="bodySmall" color="text.secondary" style={styles.ruleText}>{item}</AppText>
    </View>)}
  </View>;
}

function IconSpecimen({ icon, label, tone = 'default' }: { icon: AppIconData; label: string; tone?: 'default' | 'active' | 'secondary' }) {
  return <View style={styles.iconSpecimen}>
    <View style={styles.touchTarget}>
      <AppIcon icon={icon} tone={tone} label={`${label} icon specimen`} />
    </View>
    <AppText variant="caption" color="text.muted">{label}</AppText>
  </View>;
}

export default function FoundationsScreen() {
  if (!isDevBuild()) return <Redirect href="/" />;

  return <AppScreen scrollable contentContainerStyle={styles.content} testID="foundations-screen">
    <View style={styles.hero}>
      <AppText variant="navigationLabel" color="text.onAccent" style={styles.eyebrow}>Design system</AppText>
      <AppText variant="h1">Foundations</AppText>
      <AppText color="text.secondary">A restrained analog-inspired system for Music Room. Editorial, tactile, intentionally dark, and built for native screens.</AppText>
    </View>

    <Section number="01" title="Visual direction" description="Translate nostalgic music culture into a modern product without turning the interface into a themed poster.">
      <View style={styles.chipRow}>
        {[
          ['Analog nostalgia', colors.action.primary, 'text.onAccent'],
          ['Tactile', colors.action.secondary, 'text.onAccent'],
          ['Editorial', colors.background.app, 'text.primary'],
          ['Warm', colors.category.secondary, 'text.primary'],
          ['Premium', colors.action.primary, 'text.onAccent'],
          ['Cinematic', colors.action.secondary, 'text.onAccent'],
        ].map(([label, backgroundColor, textColor]) => <View key={label} style={[styles.chip, { backgroundColor }]}>
          <AppText variant="navigationLabel" color={textColor as SemanticColorRole}>{label}</AppText>
        </View>)}
      </View>
      <View style={styles.rules}>
        <RuleList title="Use" items={useRules} accent="secondary" />
        <RuleList title="Avoid" items={avoidRules} accent="primary" />
      </View>
    </Section>

    <Section number="02" title="Color system" description="Primitive colors are the source values; semantic colors express product intent.">
      <AppText variant="h5">Primitive palette</AppText>
      <View style={styles.swatchGrid}>
        {primitiveSwatches.map((swatch) => <View key={swatch.label} style={[styles.swatch, { backgroundColor: swatch.color }]}>
          <AppText variant="navigationLabel" color={swatch.textColor ?? 'text.primary'}>{swatch.label}</AppText>
          <AppText variant="caption" color={swatch.textColor ?? 'text.primary'}>{swatch.value}</AppText>
        </View>)}
      </View>
      <AppText variant="h5">Semantic roles</AppText>
      <View style={styles.semanticGrid}>
        {semanticSwatches.map(([label, value]) => <View key={label} style={styles.semanticItem}>
          <View style={[styles.semanticDot, { backgroundColor: value }]} />
          <View style={styles.semanticCopy}>
            <AppText variant="bodySmall">{label}</AppText>
            <AppText variant="caption" color="text.muted">{value}</AppText>
          </View>
        </View>)}
      </View>
    </Section>

    <Section number="03" title="Typography" description="Sora carries the identity. Each specimen below is rendered with the production token.">
      {typeSpecimens.map((specimen) => <View key={specimen.variant} style={styles.typeSpecimen}>
        <AppText variant="caption" color="text.muted">{specimen.label}</AppText>
        <AppText variant={specimen.variant}>{specimen.copy}</AppText>
      </View>)}
    </Section>

    <Section number="04" title="Spacing system" description="A single measured scale controls rhythm from icon gaps to large sections.">
      {(Object.entries(spacing) as Array<[string, number]>).map(([token, value]) => <View key={token} style={styles.spacingRow}>
        <AppText variant="caption" color="text.muted" style={styles.spacingLabel}>{token}px</AppText>
        <View style={[styles.spacingBar, { width: value }]} />
      </View>)}
    </Section>

    <Section number="05" title="Border radius" description="Use the documented shape by component purpose; do not invent intermediate radii.">
      <View style={styles.radiusGrid}>
        {radiusSpecimens.map(([label, value]) => <View key={label} style={[styles.radiusSpecimen, { borderRadius: value }]}>
          <AppText variant="navigationLabel">{label}</AppText>
          <AppText variant="caption" color="text.muted">radius / {value}px</AppText>
        </View>)}
      </View>
    </Section>

    <Section number="06" title="Responsive grid" description="The reference frame is a guide, not a fixed screen width. Content remains fluid on every device.">
      <AppText variant="navigationLabel">Mobile · {grid.referenceWidth}px · {grid.columns} columns · {grid.margin} margin · {grid.gutter} gutter</AppText>
      <View style={styles.gridFrame}>
        {Array.from({ length: grid.columns }, (_, index) => <View key={index} style={styles.gridColumn} />)}
      </View>
    </Section>

    <Section number="07" title="Elevation" description="Depth comes from restrained contrast and subtle shadows—not glassmorphism.">
      <View style={[styles.elevationSpecimen, shadows.subtle]}>
        <AppText variant="h5">Subtle card</AppText>
        <AppText variant="bodySmall" color="text.secondary">For cards that need separation from the app canvas.</AppText>
      </View>
      <View style={[styles.elevationSpecimen, shadows.floating]}>
        <AppText variant="h5">Floating surface</AppText>
        <AppText variant="bodySmall" color="text.secondary">For overlays, modal surfaces, and elevated playback UI.</AppText>
      </View>
    </Section>

    <Section number="08" title="Iconography" description="Use one minimalist geometric family and keep visual weight consistent.">
      <View style={styles.iconRules}>
        <View style={styles.iconRule}><AppText variant="navigationLabel">Sizes</AppText><AppText variant="bodySmall" color="text.secondary">{iconMetrics.compact}px compact · {iconMetrics.standard}px standard</AppText></View>
        <View style={styles.iconRule}><AppText variant="navigationLabel">Stroke</AppText><AppText variant="bodySmall" color="text.secondary">1.5–2px · rounded where appropriate</AppText></View>
        <View style={styles.iconRule}><AppText variant="navigationLabel">Touch target</AppText><AppText variant="bodySmall" color="text.secondary">{layout.minimumTouchTarget}px minimum interactive area</AppText></View>
        <View style={styles.iconRule}><AppText variant="navigationLabel">Color</AppText><AppText variant="bodySmall" color="text.secondary">Cream default · Coral active · Teal secondary</AppText></View>
      </View>
      <View style={styles.iconRow}>
        <IconSpecimen icon={Search01Icon} label="Search" />
        <IconSpecimen icon={PlayIcon} label="Play" tone="active" />
        <IconSpecimen icon={MoreVerticalIcon} label="More" />
        <View style={styles.iconSpecimen}>
          <View style={styles.touchTarget}><View accessibilityLabel="System icon specimen" accessibilityRole="image" style={styles.systemGlyph} /></View>
          <AppText variant="caption" color="text.muted">System</AppText>
        </View>
      </View>
    </Section>

    <Section number="09" title="Button specimens" description="Static default-size references from Figma node 23:73. Interaction states come in the next milestone.">
      <View style={[styles.button, styles.primaryButton]}><AppText variant="buttonLabel" color="text.onAccent">Primary button</AppText></View>
      <View style={[styles.button, styles.secondaryButton]}><AppText variant="buttonLabel">Secondary button</AppText></View>
      <View style={[styles.button, styles.ghostButton]}><AppText variant="buttonLabel">Ghost button</AppText></View>
    </Section>

    <View style={styles.implementationRule}>
      <AppText variant="h5">Implementation rule</AppText>
      <AppText variant="bodySmall" color="text.secondary">All future screens use semantic colors, Sora text styles, reusable components, responsive constraints, and these spacing, radius, and grid rules. Absolute positioning is reserved for inherently freeform geometry.</AppText>
    </View>
  </AppScreen>;
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[32],
    paddingBottom: spacing[64],
    gap: spacing[24],
  },
  hero: {
    gap: spacing[12],
  },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: colors.action.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[4],
  },
  section: {
    overflow: 'hidden',
    gap: spacing[24],
    padding: spacing[24],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  sectionHeader: {
    gap: spacing[8],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[12],
  },
  chip: {
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.full,
  },
  rules: {
    gap: spacing[24],
  },
  ruleColumn: {
    gap: spacing[12],
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[8],
  },
  ruleDot: {
    width: 6,
    height: 6,
    marginTop: 7,
    borderRadius: radius.full,
  },
  ruleText: {
    flex: 1,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[12],
  },
  swatch: {
    minWidth: 116,
    flexGrow: 1,
    flexBasis: '42%',
    gap: spacing[4],
    padding: spacing[16],
    borderRadius: radius.card,
  },
  semanticGrid: {
    gap: spacing[12],
  },
  semanticItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
  },
  semanticDot: {
    width: spacing[24],
    height: spacing[24],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.small,
  },
  semanticCopy: {
    flex: 1,
  },
  typeSpecimen: {
    gap: spacing[8],
    paddingBottom: spacing[16],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    minHeight: spacing[24],
  },
  spacingLabel: {
    width: 42,
  },
  spacingBar: {
    height: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.action.secondary,
  },
  radiusGrid: {
    gap: spacing[12],
  },
  radiusSpecimen: {
    gap: spacing[8],
    padding: spacing[16],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.app,
  },
  gridFrame: {
    height: 180,
    flexDirection: 'row',
    gap: grid.gutter,
    paddingHorizontal: grid.margin,
    paddingVertical: spacing[16],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
    backgroundColor: colors.background.app,
  },
  gridColumn: {
    flex: 1,
    borderRadius: radius.small,
    backgroundColor: colors.action.secondary,
    opacity: 0.3,
  },
  elevationSpecimen: {
    gap: spacing[8],
    padding: spacing[24],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  iconRules: {
    gap: spacing[12],
  },
  iconRule: {
    gap: spacing[8],
    padding: spacing[16],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[16],
  },
  iconSpecimen: {
    alignItems: 'center',
    gap: spacing[8],
  },
  touchTarget: {
    width: layout.minimumTouchTarget,
    height: layout.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
    backgroundColor: colors.background.app,
  },
  systemGlyph: {
    width: spacing[16],
    height: spacing[16],
    borderWidth: 2,
    borderColor: colors.action.secondary,
    borderRadius: spacing[4],
  },
  button: {
    height: spacing[48],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius.medium,
  },
  primaryButton: {
    backgroundColor: colors.action.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
  },
  ghostButton: {
    backgroundColor: colors.background.app,
  },
  implementationRule: {
    gap: spacing[8],
    padding: spacing[24],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
  },
});
