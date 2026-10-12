import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import {
  AppScreen,
  AppText,
  Avatar,
  BottomNavigation,
  BottomSheet,
  Button,
  DateTimePicker,
  EmptyState,
  ErrorState,
  EventCard,
  FriendRequestRow,
  LicenseBadge,
  LocationPicker,
  MiniPlayer,
  Modal,
  MusicPreferenceChip,
  PasswordField,
  PlaylistCard,
  SearchField,
  Select,
  SkeletonLoader,
  TextField,
  Toast,
  TopBar,
  TrackRow,
  UserCard,
  VisibilityBadge,
  VoteButton,
  WebPlayer,
  WebSidebar,
  type AvatarSize,
  type ButtonSize,
  type ButtonVariant,
  type LicenseType,
  type VisibilityType,
  type VoteButtonState,
} from '../../src/components/ui';
import { isDevBuild } from '../../src/config/variant';
import {
  eventCardExamples,
  friendRequestExamples,
  playlistCardExamples,
  trackRowExamples,
  userCardExamples,
} from '../../src/mocks/component-examples';
import {
  bottomSheetExamples,
  modalExamples,
  toastExamples,
} from '../../src/mocks/overlays-feedback-examples';
import {
  emptyStateExamples,
  errorStateExample,
  skeletonLoaderTypes,
} from '../../src/mocks/system-state-examples';
import {
  bottomNavigationStates,
  miniPlayerStates,
  sidebarPlaylistExamples,
  topBarStates,
  webNavigationStates,
} from '../../src/mocks/navigation-playback-examples';
import { colors, radius, spacing } from '../../src/theme';

const variants: Array<{ value: ButtonVariant; label: string; buttonLabel: string }> = [
  { value: 'primary', label: 'Primary', buttonLabel: 'Continue' },
  { value: 'accent', label: 'Accent', buttonLabel: 'Add event' },
  { value: 'secondary', label: 'Secondary', buttonLabel: 'Secondary' },
  { value: 'ghost', label: 'Ghost', buttonLabel: 'Ghost' },
  { value: 'danger', label: 'Danger', buttonLabel: 'Remove' },
];

const sizes: ButtonSize[] = ['small', 'default'];
const states = ['default', 'active', 'disabled'] as const;
const fieldStates = ['default', 'focus', 'filled', 'error', 'disabled'] as const;
const searchStates = ['default', 'focus', 'filled'] as const;
const selectStates = ['default', 'focus', 'filled', 'disabled'] as const;
const dateTimeStates = ['default', 'filled', 'error'] as const;
const locationStates = ['default', 'selected', 'permission denied'] as const;
const avatarSizes: AvatarSize[] = ['small', 'medium', 'large'];
const visibilityTypes: VisibilityType[] = ['public', 'friends', 'private'];
const licenseTypes: LicenseType[] = ['invite', 'location', 'time', 'restricted'];
const chipStates = ['default', 'selected', 'disabled'] as const;
const voteStates: VoteButtonState[] = ['available', 'voted', 'disabled', 'restricted'];

export default function ComponentsScreen() {
  const { width } = useWindowDimensions();
  const contentStyle = [
    styles.content,
    width >= 1200
      ? styles.desktopContent
      : width >= 768
        ? styles.tabletContent
        : styles.mobileContent,
  ];
  const sectionStyle = [styles.section, width < 768 && styles.compactSection];

  if (!isDevBuild()) return <Redirect href="/" />;

  return <AppScreen
    scrollable
    constrainContent={false}
    horizontalPadding={false}
    contentContainerStyle={contentStyle}
    testID="components-screen"
  >
    <View style={styles.hero}>
      <AppText variant="navigationLabel" color="action.primary">Reusable UI</AppText>
      <AppText variant="h1">Components</AppText>
      <AppText color="text.secondary">
        Core controls are built first so every mobile and responsive web mockup inherits the same interaction states, spacing, typography, and semantic color behavior.
      </AppText>
    </View>

    <View style={sectionStyle}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3">01. Buttons</AppText>
        <AppText variant="bodySmall" color="text.secondary">Primary, secondary, ghost, and destructive actions. Keep interactive height at 44px or larger and use disabled states with opacity plus contrast changes.</AppText>
      </View>

      {sizes.map((size) => <View key={size} style={styles.sizeGroup}>
        <AppText variant="h5">{size === 'default' ? 'Default · 48px' : 'Small · 44px'}</AppText>
        <View style={styles.specimenGrid}>
          {variants.flatMap((variant) => states.map((state) => <View
            key={`${variant.value}-${state}`}
            style={styles.specimen}
          >
            <AppText variant="caption" color="text.muted">{variant.label} · {state}</AppText>
            <Button
              variant={variant.value}
              size={size}
              disabled={state === 'disabled'}
              testOnly_pressed={state === 'active'}
              testID={`button-${variant.value}-${size}-${state}`}
            >
              {variant.buttonLabel}
            </Button>
          </View>))}
        </View>
      </View>)}
    </View>

    <View style={sectionStyle}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3">02. Form fields</AppText>
        <AppText variant="bodySmall" color="text.secondary">All fields share a 48px control shell, visible focus state, semantic errors, and responsive text wrapping rather than fixed-position labels.</AppText>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Text Field</AppText>
        {fieldStates.map((state) => <View key={`text-${state}`} style={styles.fieldSpecimen}>
          <AppText variant="caption" color="text.muted">{state}</AppText>
          <TextField
            label="Email"
            placeholder="Enter your email"
            value={state === 'filled' ? 'souad@musicroom.app' : state === 'error' ? 'souad@' : undefined}
            error={state === 'error'}
            disabled={state === 'disabled'}
            testOnly_focused={state === 'focus'}
            testID={`text-field-${state}`}
          />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Password Field</AppText>
        {fieldStates.map((state) => <View key={`password-${state}`} style={styles.fieldSpecimen}>
          <AppText variant="caption" color="text.muted">{state}</AppText>
          <PasswordField
            placeholder="Enter your password"
            value={state === 'filled' ? 'password' : undefined}
            error={state === 'error'}
            disabled={state === 'disabled'}
            testOnly_focused={state === 'focus'}
            testID={`password-field-${state}`}
          />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Search Field</AppText>
        {searchStates.map((state) => <View key={`search-${state}`} style={styles.fieldSpecimen}>
          <AppText variant="caption" color="text.muted">{state}</AppText>
          <SearchField
            value={state === 'filled' ? 'cassette dreams' : undefined}
            testOnly_focused={state === 'focus'}
            testID={`search-field-${state}`}
          />
        </View>)}
      </View>
    </View>

    <View style={sectionStyle}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3">03. Selectors &amp; pickers</AppText>
        <AppText variant="bodySmall" color="text.secondary">Select, date/time, and location controls reuse the field shell so technical setup screens and event creation remain visually consistent.</AppText>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Select</AppText>
        {selectStates.map((state) => <View key={`select-${state}`} style={styles.fieldSpecimen}>
          <AppText variant="caption" color="text.muted">{state}</AppText>
          <Select
            label="Visibility"
            value={state === 'filled' ? 'Friends only' : undefined}
            expanded={state === 'focus'}
            disabled={state === 'disabled'}
            testID={`select-${state}`}
          />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Date and Time Picker</AppText>
        {dateTimeStates.map((state) => <View key={`date-time-${state}`} style={styles.fieldSpecimen}>
          <AppText variant="caption" color="text.muted">{state}</AppText>
          <DateTimePicker
            value={state === 'filled' ? 'Oct 18 · 20:00' : undefined}
            error={state === 'error'}
            testID={`date-time-${state}`}
          />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Location Picker</AppText>
        {locationStates.map((state) => <View key={`location-${state}`} style={styles.fieldSpecimen}>
          <AppText variant="caption" color="text.muted">{state}</AppText>
          <LocationPicker
            value={state === 'selected' ? 'Benguerir, Morocco' : undefined}
            permissionDenied={state === 'permission denied'}
            testID={`location-${state}`}
          />
        </View>)}
      </View>
    </View>

    <View style={sectionStyle}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3">04. Identity &amp; status</AppText>
        <AppText variant="bodySmall" color="text.secondary">Avatar, visibility badges, license badges, and preference chips are compact primitives reused across profile, friends, events, and playlists.</AppText>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Avatar</AppText>
        <View style={styles.componentRow}>
          {avatarSizes.map((size) => <View key={size} style={styles.inlineSpecimen}>
            <AppText variant="caption" color="text.muted">{size}</AppText>
            <Avatar initials="SH" size={size} testID={`avatar-${size}`} />
          </View>)}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Visibility Badge</AppText>
        <View style={styles.componentRow}>
          {visibilityTypes.map((type) => <View key={type} style={styles.inlineSpecimen}>
            <AppText variant="caption" color="text.muted">{type}</AppText>
            <VisibilityBadge type={type} testID={`visibility-${type}`} />
          </View>)}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">License Badge</AppText>
        <View style={styles.componentRow}>
          {licenseTypes.map((type) => <View key={type} style={styles.inlineSpecimen}>
            <AppText variant="caption" color="text.muted">{type}</AppText>
            <LicenseBadge type={type} testID={`license-${type}`} />
          </View>)}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Music Preference Chip</AppText>
        <View style={styles.componentRow}>
          {chipStates.map((state) => <View key={state} style={styles.inlineSpecimen}>
            <AppText variant="caption" color="text.muted">{state}</AppText>
            <MusicPreferenceChip
              selected={state === 'selected'}
              disabled={state === 'disabled'}
              testID={`preference-${state}`}
            >
              Indie
            </MusicPreferenceChip>
          </View>)}
        </View>
      </View>
    </View>

    <View style={sectionStyle}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3">05. Voting</AppText>
        <AppText variant="bodySmall" color="text.secondary">Track Vote has distinct available, voted, disabled, and restricted states so permission failures are understandable without relying on color alone.</AppText>
      </View>
      <View style={styles.componentRow}>
        {voteStates.map((state) => <View key={state} style={styles.inlineSpecimen}>
          <AppText variant="caption" color="text.muted">{state}</AppText>
          <VoteButton state={state} testID={`vote-${state}`} />
        </View>)}
      </View>
    </View>

    <View style={sectionStyle}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3">06. Cards &amp; rows</AppText>
        <AppText variant="bodySmall" color="text.secondary">
          Cards remain image-led and restrained. Track rows adapt to playback, voting, and drag-and-drop editing without becoming separate one-off patterns.
        </AppText>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">User Card</AppText>
        {userCardExamples.map((example) => <View key={example.relation} style={styles.fieldSpecimen}>
          <AppText variant="caption" color="text.muted">{example.relation}</AppText>
          <UserCard {...example} testID={`user-card-${example.relation}`} />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Event Card</AppText>
        {eventCardExamples.map((example) => <View key={example.state} style={styles.fieldSpecimen}>
          <AppText variant="caption" color="text.muted">{example.state}</AppText>
          <EventCard {...example} testID={`event-card-${example.state}`} />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Playlist Card</AppText>
        {playlistCardExamples.map((example) => <View key={example.mode} style={styles.playlistSpecimen}>
          <AppText variant="caption" color="text.muted">{example.mode}</AppText>
          <PlaylistCard {...example} testID={`playlist-card-${example.mode}`} />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Track Row</AppText>
        {trackRowExamples.map((example) => <View key={example.mode} style={styles.rowSpecimen}>
          <AppText variant="caption" color="text.muted">{example.mode}</AppText>
          <TrackRow {...example} testID={`track-row-${example.mode}`} />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Friend Request Row</AppText>
        {friendRequestExamples.map((example) => <View key={example.state} style={styles.rowSpecimen}>
          <AppText variant="caption" color="text.muted">{example.state}</AppText>
          <FriendRequestRow {...example} testID={`friend-request-${example.state}`} />
        </View>)}
      </View>
    </View>

    <View style={sectionStyle}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3">07. Navigation &amp; playback</AppText>
        <AppText variant="bodySmall" color="text.secondary">
          Mobile and desktop shells use persistent navigation patterns and a compact player that can later expand into the cinematic full-player screen.
        </AppText>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Mini Player</AppText>
        {miniPlayerStates.map((state) => <View key={state} style={styles.rowSpecimen}>
          <AppText variant="caption" color="text.muted">{state}</AppText>
          <MiniPlayer
            artist="The Midnight"
            state={state}
            title="Better Off Alone"
            testID={`mini-player-${state}`}
          />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Bottom Navigation</AppText>
        {bottomNavigationStates.map((active) => <View key={active} style={styles.rowSpecimen}>
          <AppText variant="caption" color="text.muted">{active}</AppText>
          <BottomNavigation active={active} testID={`bottom-navigation-${active}`} />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Top Bar · Desktop and tablet</AppText>
        {(['desktop', 'tablet'] as const).flatMap((breakpoint) => topBarStates.map((state) => <View
          key={`${breakpoint}-${state}`}
          style={styles.rowSpecimen}
        >
          <AppText variant="caption" color="text.muted">{breakpoint} · {state}</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <TopBar
              accountName="Souad"
              breakpoint={breakpoint}
              initials="SH"
              state={state}
              testID={`top-bar-${breakpoint}-${state}`}
            />
          </ScrollView>
        </View>))}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Web Sidebar · Desktop</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.horizontalPreview}>
          {webNavigationStates.map((active) => <View key={active} style={styles.horizontalSpecimen}>
            <AppText variant="caption" color="text.muted">{active}</AppText>
            <WebSidebar
              active={active}
              playlists={sidebarPlaylistExamples}
              testID={`web-sidebar-desktop-${active}`}
            />
          </View>)}
        </ScrollView>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Web Sidebar · Tablet</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.horizontalPreview}>
          {webNavigationStates.map((active) => <View key={active} style={styles.horizontalSpecimen}>
            <AppText variant="caption" color="text.muted">{active}</AppText>
            <WebSidebar
              active={active}
              breakpoint="tablet"
              testID={`web-sidebar-tablet-${active}`}
            />
          </View>)}
        </ScrollView>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Web Player · Desktop and tablet</AppText>
        {(['desktop', 'tablet'] as const).map((breakpoint) => <View key={breakpoint} style={styles.rowSpecimen}>
          <AppText variant="caption" color="text.muted">{breakpoint}</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <WebPlayer
              artist="The Midnight"
              breakpoint={breakpoint}
              title="Better Off Alone"
              testID={`web-player-${breakpoint}`}
            />
          </ScrollView>
        </View>)}
      </View>
    </View>

    <View style={sectionStyle}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3">08. Overlays &amp; feedback</AppText>
        <AppText variant="bodySmall" color="text.secondary">
          Use modals on larger layouts and bottom sheets on mobile. Toasts report transient feedback and realtime collaboration without interrupting the task.
        </AppText>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Modal</AppText>
        {modalExamples.map((example) => <View key={example.type} style={styles.rowSpecimen}>
          <AppText variant="caption" color="text.muted">{example.type}</AppText>
          <Modal {...example} testID={`modal-${example.type}`} />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Bottom Sheet</AppText>
        {bottomSheetExamples.map((example) => <View key={example.type} style={styles.rowSpecimen}>
          <AppText variant="caption" color="text.muted">{example.type}</AppText>
          <BottomSheet {...example} testID={`bottom-sheet-${example.type}`} />
        </View>)}
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Toast</AppText>
        {toastExamples.map((example) => <View key={example.tone} style={styles.fieldSpecimen}>
          <AppText variant="caption" color="text.muted">{example.tone}</AppText>
          <Toast {...example} testID={`toast-${example.tone}`} />
        </View>)}
      </View>
    </View>

    <View style={sectionStyle}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3">09. System states</AppText>
        <AppText variant="bodySmall" color="text.secondary">
          Empty, error, retry, and loading states are reusable patterns rather than redesigned separately on every screen.
        </AppText>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Empty State</AppText>
        <View style={styles.systemStateGrid}>
          {emptyStateExamples.map((example) => <View key={example.type} style={styles.systemStateSpecimen}>
            <AppText variant="caption" color="text.muted">{example.type}</AppText>
            <EmptyState {...example} testID={'empty-state-' + example.type} />
          </View>)}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Error State</AppText>
        <View style={styles.systemStateSpecimen}>
          <AppText variant="caption" color="text.muted">error</AppText>
          <ErrorState {...errorStateExample} testID="error-state" />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="h5">Skeleton Loader</AppText>
        {skeletonLoaderTypes.map((type) => <View key={type} style={styles.rowSpecimen}>
          <AppText variant="caption" color="text.muted">{type}</AppText>
          <SkeletonLoader type={type} testID={'skeleton-loader-' + type} />
        </View>)}
      </View>
    </View>

  </AppScreen>;
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    paddingBottom: spacing[64],
  },
  desktopContent: {
    gap: spacing[48],
    paddingTop: spacing[64],
    paddingHorizontal: spacing[64],
  },
  tabletContent: {
    gap: spacing[32],
    paddingTop: spacing[32],
    paddingHorizontal: spacing[32],
  },
  mobileContent: {
    gap: spacing[24],
    paddingTop: spacing[32],
    paddingHorizontal: spacing[16],
  },
  hero: {
    gap: spacing[8],
  },
  section: {
    gap: spacing[24],
    padding: spacing[32],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  compactSection: {
    padding: spacing[24],
  },
  sectionHeader: {
    gap: spacing[24],
  },
  sizeGroup: {
    gap: spacing[16],
  },
  specimenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[12],
  },
  specimen: {
    minWidth: 116,
    flexGrow: 1,
    flexBasis: 128,
    alignItems: 'flex-start',
    gap: spacing[8],
  },
  fieldGroup: {
    gap: spacing[16],
  },
  fieldSpecimen: {
    width: '100%',
    maxWidth: 360,
    gap: spacing[8],
  },
  playlistSpecimen: {
    width: '100%',
    maxWidth: 280,
    gap: spacing[8],
  },
  rowSpecimen: {
    width: '100%',
    gap: spacing[8],
  },
  systemStateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing[16],
  },
  systemStateSpecimen: {
    width: '100%',
    maxWidth: 358,
    gap: spacing[8],
  },
  horizontalPreview: {
    alignItems: 'flex-start',
    gap: spacing[16],
    paddingBottom: spacing[8],
  },
  horizontalSpecimen: {
    alignItems: 'flex-start',
    gap: spacing[8],
  },
  componentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: spacing[16],
  },
  inlineSpecimen: {
    alignItems: 'flex-start',
    gap: spacing[8],
  },
});
