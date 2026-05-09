import { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme';

export function Screen({ children }: PropsWithChildren) {
  return (
    <LinearGradient colors={['#170b08', colors.bg, '#07111d']} locations={[0, 0.42, 1]} style={styles.screen}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      {children}
    </LinearGradient>
  );
}

export function Card({ children }: PropsWithChildren) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHighlight} />
      {children}
    </View>
  );
}

export function Button({ label, onPress, tone = 'primary', loading = false }: { label: string; onPress?: () => void; tone?: 'primary' | 'secondary' | 'danger'; loading?: boolean }) {
  const content = loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.buttonText}>{label}</Text>;
  if (tone === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [styles.buttonShell, pressed && styles.pressed]}>
        <LinearGradient colors={[colors.orange, '#ff8a1f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, styles.flatButton, tone === 'danger' && styles.dangerButton, pressed && styles.pressed]} disabled={loading}>
      {content}
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} style={styles.field} {...props} />;
}

export function Badge({ label, tone }: { label: string; tone: 'pending' | 'delivered' | 'failed' | 'info' }) {
  const color = tone === 'delivered' ? colors.green : tone === 'failed' ? colors.red : tone === 'info' ? colors.blue : colors.amber;
  return <Text style={[styles.badge, { color, borderColor: color, backgroundColor: `${color}18` }]}>{label}</Text>;
}

export function Money({ value, size = 24 }: { value: number; size?: number }) {
  return <Text style={{ color: colors.amber, fontWeight: '900', fontSize: size }}>₹{value.toLocaleString('en-IN')}</Text>;
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.page,
    paddingTop: 56,
  },
  glowTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,107,0,0.16)',
    top: -92,
    right: -110,
  },
  glowBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(78,156,255,0.11)',
    bottom: 40,
    left: -130,
  },
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: spacing.radius,
    padding: spacing.card,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  header: { marginBottom: 18 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 0 },
  subtitle: { color: colors.muted, marginTop: 6, fontSize: 13, lineHeight: 18 },
  buttonShell: {
    borderRadius: 15,
    shadowColor: colors.orange,
    shadowOpacity: 0.34,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  button: {
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  flatButton: {
    backgroundColor: colors.glassStrong,
    borderColor: colors.border,
    borderWidth: 1,
  },
  dangerButton: { backgroundColor: colors.red },
  buttonText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  field: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: colors.glass,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 15,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },
});
