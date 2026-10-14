import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Button, EventCard, LicenseBadge, SearchField, VisibilityBadge } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import eventContent from '../../content/events.json';
import { goBackOrReplace } from '../../lib/navigation';
import { eventScreenStyles as styles } from './track-vote-screen.styles';
import { EventHeader, EventScreen, SectionRow, eventStyles } from './track-vote-ui';

export function DiscoverEventsScreen() {
  const router = useRouter();

  return <EventScreen showNavigation testID="discover-events-screen">
    <EventHeader title="Events" action />
    <AppText variant="h2">Vote together.{`\n`}Hear what wins.</AppText>
    <Button variant="accent" onPress={() => router.push('/events/create')}>Add event</Button>
    <SearchField placeholder="Search events" />
    <SectionRow title="Live now" />
    <EventCard
      title={eventContent.discovery.live.title}
      state="live"
      meta={eventContent.discovery.live.meta}
      attendeeSummary={eventContent.discovery.live.attendeeSummary}
      onPress={() => router.push('/events/details')}
      testID="live-event-card"
    />
    <SectionRow title="Coming up" />
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/events/details')}
      style={({ pressed }) => [styles.upcomingCard, pressed && pressedFeedback]}
    >
      <View style={styles.upcomingArtwork} />
      <View style={styles.flexCopy}>
        <AppText variant="navigationLabel">{eventContent.discovery.upcoming.title}</AppText>
        <AppText variant="caption" color="text.muted">{eventContent.discovery.upcoming.meta}</AppText>
      </View>
      <AppText variant="caption" color="text.muted">{eventContent.discovery.upcoming.visibility}</AppText>
    </Pressable>
  </EventScreen>;
}

export function EventDetailsScreen() {
  const router = useRouter();

  return <EventScreen testID="event-details-screen">
    <EventHeader title="Event details" onBack={() => goBackOrReplace(router, '/events')} />
    <View style={styles.eventHero}>
      <View style={styles.heroCircle} />
      <View style={styles.heroCard} />
      <View style={styles.heroTape} />
    </View>
    <AppText variant="h2">{eventContent.details.title}</AppText>
    <AppText color="text.secondary">{eventContent.details.description}</AppText>
    {eventContent.details.information.map((label) => <InfoLine key={label} label={label} />)}
    <View style={eventStyles.wrap}>
      <VisibilityBadge type="public" />
      <LicenseBadge type="location" />
      <LicenseBadge type="time" />
    </View>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/room')}>Join event</Button>
  </EventScreen>;
}

function InfoLine({ label }: { label: string }) {
  return <View style={styles.infoLine}>
    <View style={styles.infoDot} />
    <AppText color="text.secondary">{label}</AppText>
  </View>;
}
