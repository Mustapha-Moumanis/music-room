import { Stack } from 'expo-router';

export default function AppLayout() {
  return <Stack screenOptions={{ animation: 'slide_from_right', headerShown: false }}>
    <Stack.Screen name="player" options={{ animation: 'slide_from_bottom' }} />
  </Stack>;
}
