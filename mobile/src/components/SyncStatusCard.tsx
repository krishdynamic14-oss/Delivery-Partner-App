import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from './ui';
import type { AppColors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { SyncStatus } from '../types';
import { useTheme } from '../state/ThemeContext';

export function SyncStatusCard({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);
  const { isOnline, pendingSync, syncMeta, syncing, syncOfflineQueue } = useOrders();
  const status = isOnline === false ? 'offline' : syncMeta.status;
  const color = getStatusColor(status, colors);
  const title = getStatusTitle(status, pendingSync, syncing);
  const message = isOnline === false
    ? pendingSync
      ? `${pendingSync} action(s) saved offline. Sync will retry when network returns.`
      : 'Network unavailable. New actions will be saved offline.'
    : syncMeta.message;

  return (
    <Card>
      <View style={styles.headerRow}>
        <View style={[styles.statusIcon, { backgroundColor: `${color}22` }]}>
          <MaterialCommunityIcons name={status === 'offline' ? 'cloud-off-outline' : 'cloud-sync-outline'} size={20} color={color} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>{isOnline === false ? 'Offline mode' : 'Google Sheets sync'}</Text>
        </View>
        <Text style={[styles.pill, { color, borderColor: color, backgroundColor: `${color}18` }]}>
          {pendingSync} pending
        </Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      {!compact && syncMeta.lastError ? <Text style={styles.error}>{syncMeta.lastError}</Text> : null}
      <View style={styles.footer}>
        <Text style={styles.time}>Last sync: {formatSyncTime(syncMeta.lastSyncAt)}</Text>
        <Button label="Sync now" tone="secondary" loading={syncing} onPress={() => void syncOfflineQueue()} />
      </View>
    </Card>
  );
}

function getStatusTitle(status: SyncStatus, pendingSync: number, syncing: boolean) {
  if (syncing || status === 'syncing') return 'Syncing updates';
  if (status === 'offline') return pendingSync ? 'Offline queue active' : 'Offline';
  if (pendingSync > 0) return 'Sync pending';
  if (status === 'warning') return 'Sync needs attention';
  if (status === 'error') return 'Sync failed';
  if (status === 'success') return 'All synced';
  return 'Sync status';
}

function getStatusColor(status: SyncStatus, colors: AppColors) {
  if (status === 'success') return colors.green;
  if (status === 'warning' || status === 'offline') return colors.amber;
  if (status === 'error') return colors.red;
  if (status === 'syncing') return colors.blue;
  return colors.muted;
}

function formatSyncTime(value?: string) {
  if (!value) return 'Not yet';
  return new Date(value).toLocaleString();
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1 },
  title: { color: colors.text, fontSize: 17, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, fontWeight: '900', overflow: 'hidden' },
  message: { color: colors.text, marginTop: 14, lineHeight: 20, fontWeight: '700' },
  error: { color: colors.red, marginTop: 8, lineHeight: 18, fontSize: 12 },
  footer: { gap: 10, marginTop: 14 },
  time: { color: colors.muted, fontSize: 12 },
  });
}
