import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, TextField } from '../../components/ui';
import eventContent from '../../content/events.json';
import { goBackOrReplace } from '../../lib/navigation';
import { EventScheduleFields } from './event-schedule-fields';
import { eventScreenStyles as styles } from './track-vote-screen.styles';
import { ChoiceCard, EventHeader, EventScreen, eventStyles } from './track-vote-ui';

function CreateEventIntro({ step, title, description }: { step: string; title: string; description: string }) {
  return <>
    <AppText variant="navigationLabel" color="action.primary">{step}</AppText>
    <AppText variant="h2">{title}</AppText>
    <AppText variant="bodySmall" color="text.secondary">{description}</AppText>
  </>;
}

export function CreateEventBasicScreen() {
  const router = useRouter();
  const [name, setName] = useState(eventContent.create.defaults.name);
  const [description, setDescription] = useState(eventContent.create.defaults.description);

  return <EventScreen testID="create-event-basic-screen">
    <EventHeader title="Create event" onBack={() => goBackOrReplace(router, '/events')} />
    <CreateEventIntro {...eventContent.create.steps[0]} />
    <View style={eventStyles.form}>
      <TextField label="Event name" value={name} onChangeText={setName} />
      <TextField label="Short description" value={description} onChangeText={setDescription} />
      <View style={styles.eventType}>
        <View style={styles.flexCopy}><AppText variant="navigationLabel">Track Vote</AppText><AppText variant="caption" color="text.muted">Participants suggest tracks and vote the queue.</AppText></View>
        <AppText variant="caption" color="action.secondary">EVENT TYPE</AppText>
      </View>
    </View>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/create/visibility')}>Continue</Button>
  </EventScreen>;
}

export function CreateEventVisibilityScreen() {
  const router = useRouter();
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');

  return <EventScreen testID="create-event-visibility-screen">
    <EventHeader title="Create event" onBack={() => goBackOrReplace(router, '/events/create')} />
    <CreateEventIntro {...eventContent.create.steps[1]} />
    <View accessibilityRole="radiogroup" style={eventStyles.form}>
      {eventContent.create.visibilityOptions.map((option) => <ChoiceCard key={option.value} {...option} selected={visibility === option.value} onPress={() => setVisibility(option.value as 'Public' | 'Private')} />)}
    </View>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/create/voting-rules')}>Continue</Button>
  </EventScreen>;
}

export function CreateEventVotingRulesScreen() {
  const router = useRouter();
  const [rule, setRule] = useState<'everyone' | 'invite' | 'place-time'>('place-time');

  return <EventScreen testID="create-event-voting-rules-screen">
    <EventHeader title="Create event" onBack={() => goBackOrReplace(router, '/events/create/visibility')} />
    <CreateEventIntro {...eventContent.create.steps[2]} />
    <View accessibilityRole="radiogroup" style={eventStyles.form}>
      {eventContent.create.votingRuleOptions.map((option) => <ChoiceCard key={option.value} {...option} selected={rule === option.value} onPress={() => setRule(option.value as 'everyone' | 'invite' | 'place-time')} />)}
    </View>
    <AppText variant="bodySmall" color="text.secondary">These restrictions are shown explicitly so the permission model stays clear in the prototype.</AppText>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/create/schedule')}>Continue</Button>
  </EventScreen>;
}

export function CreateEventScheduleScreen() {
  const router = useRouter();

  return <EventScreen testID="create-event-schedule-screen">
    <EventHeader title="Create event" onBack={() => goBackOrReplace(router, '/events/create/voting-rules')} />
    <CreateEventIntro {...eventContent.create.steps[3]} />
    <EventScheduleFields />
    <View style={eventStyles.grow} />
    <Button onPress={() => router.replace('/events/owner')}>Publish event</Button>
  </EventScreen>;
}
