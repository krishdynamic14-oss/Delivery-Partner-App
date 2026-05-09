import { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, spacing } from '../theme';

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.screen}>{children}</View>;
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function Button({ label, onPress, tone = 'primary', loading = false }: { label: string; onPress?: () => void; tone?: 'primary' | 'secondary' | 'danger'; loading?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, tone === 'secondary' && styles.secondaryButton, tone === 'danger' && styles.dangerButton]} disabled={loading}>
      {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} style={styles.field} {...props} />;
}

export function Badge({ label, tone }: { label: string; tone: 'pending' | 'delivered' | 'failed' | 'info' }) {
  const color = tone === 'delivered' ? colors.green : tone === 'failed' ? colors.red : tone === 'info' ? colors.blue : colors.amber;
  return <Text style={[styles.badge, { color, borderColor: color }]}>{label}</Text>;
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
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.page,
    paddingTop: 56,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: spacing.radius,
    padding: spacing.card,
    marginBottom: 12,
  },
  header: { marginBottom: 18 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.muted, marginTop: 5, fontSize: 13 },
  button: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButton: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
  },
  dangerButton: { backgroundColor: colors.red },
  buttonText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  field: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    marginBottom: 12,
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
