import { useState, type ComponentProps, type PropsWithChildren } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { background: '#111513', panel: '#1b211d', text: '#f0f0e8', muted: '#a6b0a9', accent: '#d8ed95', error: '#ffaaa0', border: '#354138' };

export function Screen({ children, refreshing = false, onRefresh }: PropsWithChildren<{ refreshing?: boolean; onRefresh?: () => void }>) {
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
    refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} /> : undefined}>
    {children}
  </ScrollView></SafeAreaView>;
}

export function Action({ title, onPress, disabled = false, loading = false, secondary = false, compact = false }: {
  title: string; onPress: () => void; disabled?: boolean; loading?: boolean; secondary?: boolean; compact?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || loading, busy: loading }}
    disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => [styles.button, compact && styles.compact, secondary && styles.secondary, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>
    {loading ? <ActivityIndicator color={secondary ? colors.accent : colors.background} /> : <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text>}
  </Pressable>;
}

export function Field({ label, hint, ...input }: ComponentProps<typeof TextInput> & { label: string; hint?: string }) {
  return <View style={{ gap: 10 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput accessibilityLabel={label} style={[styles.input, input.multiline && styles.multiline]} placeholderTextColor={colors.muted}
      autoCapitalize="none" autoCorrect={false} {...input} />
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>;
}

/** A toggle (checkbox or radio) when onPress is set, otherwise a read-only tag. */
export function Chip({ label, selected = false, onPress, role = 'checkbox', disabled = false }: {
  label: string; selected?: boolean; onPress?: () => void; role?: 'checkbox' | 'radio'; disabled?: boolean;
}) {
  if (!onPress) return <View style={[styles.chip, styles.chipSelected]}><Text style={[styles.chipText, styles.chipTextSelected]}>{label}</Text></View>;
  return <Pressable accessibilityRole={role} accessibilityState={{ checked: selected, disabled }} accessibilityLabel={label}
    disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.chip, selected && styles.chipSelected, disabled && !selected && styles.disabled, pressed && styles.pressed]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>;
}

export function Avatar({ name, url, size = 48 }: { name: string; url?: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (url && !failed) {
    return <Image accessibilityIgnoresInvertColors source={{ uri: url }} style={[styles.avatar, shape]} onError={() => setFailed(true)} />;
  }
  return <View style={[styles.avatar, shape]}>
    <Text style={[styles.avatarInitial, { fontSize: size * 0.42 }]}>{name.trim().charAt(0).toUpperCase() || '?'}</Text>
  </View>;
}

export function ErrorText({ children }: PropsWithChildren) {
  return <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{children}</Text>;
}

export function LoadingScreen() {
  return <View style={styles.loading}><ActivityIndicator color={colors.accent} /><Text style={styles.body}>Loading your settings…</Text></View>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, paddingTop: 40, gap: 20 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 3 },
  title: { color: colors.text, fontSize: 38, fontWeight: '700', letterSpacing: -1 },
  heading: { color: colors.text, fontSize: 20, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  panel: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, padding: 20, borderRadius: 16, gap: 12 },
  label: { color: colors.text, fontSize: 15, fontWeight: '600' },
  url: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  input: { backgroundColor: colors.panel, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, fontSize: 16 },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  button: { minHeight: 52, padding: 16, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  compact: { minHeight: 40, paddingVertical: 8, paddingHorizontal: 14 },
  secondary: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.background, fontWeight: '700', fontSize: 16 },
  secondaryText: { color: colors.text },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75 },
  error: { color: colors.error, fontSize: 15, lineHeight: 23 },
  success: { color: colors.accent, fontSize: 15, lineHeight: 23 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 36, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  chipTextSelected: { color: colors.background },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowText: { flex: 1, gap: 2 },
  avatar: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarInitial: { color: colors.accent, fontWeight: '700' },
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 20 },
});
