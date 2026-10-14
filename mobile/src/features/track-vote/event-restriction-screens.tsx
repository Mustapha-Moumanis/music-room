import { SquareLock01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { Linking, View } from 'react-native';

import { AppIcon, AppText, Button } from '../../components/ui';
import eventContent from '../../content/events.json';
import { goBackOrReplace } from '../../lib/navigation';
import { eventScreenStyles as styles } from './track-vote-screen.styles';
import { EventHeader, EventScreen, RestrictionCard, eventStyles } from './track-vote-ui';

type RestrictionKind = 'invite' | 'location' | 'time' | 'permission' | 'not-found';

const restrictions = eventContent.restrictions as Record<RestrictionKind, { title: string; description: string; action: string }>;

function VotingRestrictionScreen({ kind }: { kind: RestrictionKind }) {
  const router = useRouter();
  const restriction = restrictions[kind];
  const resolveRestriction = () => {
    if (kind === 'permission') void Linking.openSettings();
    else if (kind === 'not-found') router.replace('/events');
    else router.replace('/events/details');
  };

  return <EventScreen testID={`voting-restriction-${kind}-screen`}>
    <EventHeader title="Voting unavailable" onBack={() => goBackOrReplace(router, '/events/details')} />
    <AppText variant="navigationLabel" color="action.primary">VOTE RESTRICTED</AppText>
    <RestrictionCard title={restriction.title} description={restriction.description} />
    <View style={styles.restrictionNotice}>
      <AppIcon icon={SquareLock01Icon} size="compact" />
      <AppText variant="bodySmall" color="text.secondary" style={styles.flexCopy}>Your vote was not submitted. The queue stays unchanged.</AppText>
    </View>
    <View style={eventStyles.grow} />
    <View style={eventStyles.buttonStack}>
      <Button onPress={resolveRestriction}>{restriction.action}</Button>
      <Button variant="secondary" onPress={() => router.replace('/events/room')}>Return to event</Button>
    </View>
  </EventScreen>;
}

export function InviteRestrictionScreen() { return <VotingRestrictionScreen kind="invite" />; }
export function LocationRestrictionScreen() { return <VotingRestrictionScreen kind="location" />; }
export function TimeRestrictionScreen() { return <VotingRestrictionScreen kind="time" />; }
export function PermissionRestrictionScreen() { return <VotingRestrictionScreen kind="permission" />; }
export function NotFoundRestrictionScreen() { return <VotingRestrictionScreen kind="not-found" />; }
