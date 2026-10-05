import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { background: '#111513', panel: '#1b211d', text: '#f0f0e8', muted: '#a6b0a9', accent: '#d8ed95', error: '#ffaaa0', border: '#354138' };

export function Screen({ children }: PropsWithChildren) {
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView></SafeAreaView>;
}

export function Action({ title, onPress, disabled = false, loading = false, secondary = false }: {
  title: string; onPress: () => void; disabled?: boolean; loading?: boolean; secondary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || loading, busy: loading }}
    disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>
    {loading ? <ActivityIndicator color={secondary ? colors.accent : colors.background} /> : <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text>}
  </Pressable>;
}

export function LoadingScreen() {
  return <View style={styles.loading}><ActivityIndicator color={colors.accent} /><Text style={styles.body}>Loading your settings…</Text></View>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, paddingTop: 40, gap: 20 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 3 },
  title: { color: colors.text, fontSize: 38, fontWeight: '700', letterSpacing: -1 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  panel: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, padding: 20, borderRadius: 16, gap: 12 },
  label: { color: colors.text, fontSize: 15, fontWeight: '600' },
  url: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  input: { backgroundColor: colors.panel, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, fontSize: 16 },
  button: { minHeight: 52, padding: 16, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.background, fontWeight: '700', fontSize: 16 },
  secondaryText: { color: colors.text },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75 },
  error: { color: colors.error, fontSize: 15, lineHeight: 23 },
  success: { color: colors.accent, fontSize: 15, lineHeight: 23 },
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 20 },
});
