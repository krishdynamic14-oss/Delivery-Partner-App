import { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, type AppColors } from '../theme';
import type { DeadlineStatus } from '../types';
import { useTheme } from '../state/ThemeContext';

export function Screen({ children, bottomPadding = 104 }: PropsWithChildren<{ bottomPadding?: number }>) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  return (
    <LinearGradient
      colors={theme.colors.gradient}
      locations={[0, 0.42, 1]}
      style={[styles.screen, { paddingTop: Math.max(42, insets.top + 18), paddingBottom: insets.bottom + bottomPadding }]}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      {children}
    </LinearGradient>
  );
}

export function Card({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  return (
    <View style={styles.card}>
      <View style={styles.cardHighlight} />
      {children}
    </View>
  );
}

export function Button({ label, onPress, tone = 'primary', loading = false }: { label: string; onPress?: () => void; tone?: 'primary' | 'secondary' | 'danger'; loading?: boolean }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);
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

export function Field({ style, ...props }: TextInputProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  return <TextInput placeholderTextColor={theme.colors.muted} style={[styles.field, style]} {...props} />;
}

export function Badge({ label, tone }: { label: string; tone: 'pending' | 'delivered' | 'failed' | 'info' }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);
  const color = tone === 'delivered' ? colors.green : tone === 'failed' ? colors.red : tone === 'info' ? colors.blue : colors.amber;
  return <Text style={[styles.badge, { color, borderColor: color, backgroundColor: `${color}18` }]}>{label}</Text>;
}

export function DeadlineBadge({ status, label }: { status: DeadlineStatus; label: string }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);
  const color = status === 'overdue' || status === 'unplanned' ? colors.red : status === 'due_today' ? colors.amber : colors.green;
  return <Text style={[styles.badge, { color, borderColor: color, backgroundColor: `${color}18` }]}>{label}</Text>;
}

export function Money({ value, size = 24 }: { value: number; size?: number }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  return <Text style={{ color: colors.amber, fontWeight: '900', fontSize: size }}>₹{value.toLocaleString('en-IN')}</Text>;
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function InfoRow({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.amber} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export function StepPill({ index, label, active = false, done = false }: { index: number; label: string; active?: boolean; done?: boolean }) {
  const { theme } = useTheme();
  const styles = getStyles(theme.colors);
  return (
    <View style={[styles.stepPill, active && styles.stepActive, done && styles.stepDone]}>
      <Text style={[styles.stepIndex, (active || done) && styles.stepIndexActive]}>{done ? '✓' : index}</Text>
      <Text style={[styles.stepLabel, (active || done) && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

const styleCache = new WeakMap<AppColors, ReturnType<typeof createStyles>>();

function getStyles(colors: AppColors) {
  const cached = styleCache.get(colors);
  if (cached) return cached;
  const next = createStyles(colors);
  styleCache.set(colors, next);
  return next;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.page,
  },
  glowTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.glowTop,
    top: -92,
    right: -110,
  },
  glowBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.glowBottom,
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
    backgroundColor: colors.cardHighlight,
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
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,179,71,0.12)',
  },
  infoLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 3 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  stepPill: {
    flex: 1,
    minHeight: 58,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  stepActive: { borderColor: colors.amber, backgroundColor: 'rgba(255,179,71,0.14)' },
  stepDone: { borderColor: colors.green, backgroundColor: 'rgba(0,200,150,0.12)' },
  stepIndex: { color: colors.muted, fontWeight: '900', marginBottom: 3 },
  stepIndexActive: { color: colors.text },
  stepLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  stepLabelActive: { color: colors.text },
  });
}
