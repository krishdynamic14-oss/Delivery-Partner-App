import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Header, InfoRow, Screen } from '../components/ui';
import { SyncStatusCard } from '../components/SyncStatusCard';
import { themes, type AppColors, type ThemeName } from '../theme';
import { useAuth } from '../state/AuthContext';
import { useOrders } from '../state/OrdersContext';
import { loadQueue, saveQueue } from '../services/storage';
import { loadQueueForUser, queueBelongsToUser } from '../services/offlineQueue';
import { loadPushRegistrationStatus } from '../services/storage';
import { setupPushNotifications } from '../services/notifications';
import type { PushRegistrationStatus, QueueAction } from '../types';
import { useTheme } from '../state/ThemeContext';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { pendingSync, discardQueuedAction } = useOrders();
  const { theme, themeName, setThemeName } = useTheme();
  const styles = createStyles(theme.colors);
  const [queuedActions, setQueuedActions] = useState<QueueAction[]>([]);
  const [pushStatus, setPushStatus] = useState<PushRegistrationStatus>();
  const [pushRetrying, setPushRetrying] = useState(false);

  async function refreshQueueDetails() {
    const queue = await loadQueueForUser(user);
    setQueuedActions(queue);
    setPushStatus(await loadPushRegistrationStatus());
  }

  useEffect(() => {
    refreshQueueDetails();
  }, [pendingSync, user?.id]);

  async function attachScreenshot(actionId: string) {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.45,
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const base64 = asset.base64 || undefined;
    if (!base64) {
      Alert.alert('Screenshot not attached', 'Please select screenshot again.');
      return;
    }

    const queue = await loadQueue();
    const nextQueue = queue.map((action) => {
      if (action.id !== actionId || action.type !== 'settle' || !queueBelongsToUser(action, user)) return action;
      return {
        ...action,
        payload: {
          ...action.payload,
          photoUri: asset.uri,
          photoBase64: base64,
          photoMimeType: asset.mimeType || 'image/jpeg',
          photoFileName: asset.fileName ?? `payment-proof-${Date.now()}.jpg`,
        },
      };
    });
    await saveQueue(nextQueue);
    setQueuedActions(nextQueue.filter((action) => queueBelongsToUser(action, user)));
    Alert.alert('Screenshot attached', 'Ab Sync now dabao. Ye pending payment proof upload hoga.');
  }

  async function retryPushRegistration() {
    if (!user) return;
    setPushRetrying(true);
    try {
      await setupPushNotifications(user);
      const nextStatus = await loadPushRegistrationStatus();
      setPushStatus(nextStatus);
      Alert.alert(nextStatus.status === 'registered' ? 'Push registered' : 'Push not registered', nextStatus.message);
    } finally {
      setPushRetrying(false);
    }
  }

  function confirmRemove(action: QueueAction) {
    Alert.alert(
      'Remove pending action?',
      'Ye sirf phone se local pending action delete karega. Google Sheet me kuch upload nahi hoga.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await discardQueuedAction(action.id);
            await refreshQueueDetails();
          },
        },
      ],
    );
  }

  return (
    <Screen bottomPadding={118}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Header title="Profile" subtitle={`${user?.role === 'admin' ? 'Admin' : 'Partner'} settings and sync status`} />
        <Card>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0] || 'D'}</Text></View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.meta}>{user?.district} · {user?.role === 'admin' ? 'Admin' : 'Delivery Partner'}</Text>
          <InfoRow icon="phone-outline" label="Mobile" value={user?.phone || '-'} />
          <InfoRow icon="cloud-sync-outline" label="Pending offline actions" value={String(pendingSync)} />
        </Card>
        <SyncStatusCard />
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>App Theme</Text>
          <Text style={[styles.helperText, { color: theme.colors.muted }]}>Choose the display style for this phone.</Text>
          <View style={styles.themeGrid}>
            {(Object.keys(themes) as ThemeName[]).map((name) => {
              const item = themes[name];
              const active = name === themeName;
              return (
                <Pressable
                  key={name}
                  onPress={() => { void setThemeName(name); }}
                  style={({ pressed }) => [
                    styles.themeOption,
                    {
                      borderColor: active ? theme.colors.orange : theme.colors.border,
                      backgroundColor: active ? `${theme.colors.orange}20` : theme.colors.glass,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.themeSwatches}>
                    <View style={[styles.themeSwatch, { backgroundColor: item.colors.bg }]} />
                    <View style={[styles.themeSwatch, { backgroundColor: item.colors.orange }]} />
                    <View style={[styles.themeSwatch, { backgroundColor: item.colors.green }]} />
                  </View>
                  <Text style={[styles.themeTitle, { color: theme.colors.text }]}>{item.label}</Text>
                  <Text style={[styles.themeSub, { color: theme.colors.muted }]}>{item.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Push Notifications</Text>
          <Text style={[styles.helperText, { color: theme.colors.muted }]}>{pushStatus?.message || 'Push notification registration not checked yet.'}</Text>
          {pushStatus?.tokenPreview ? <Text style={styles.queueTime}>Token {pushStatus.tokenPreview}</Text> : null}
          {pushStatus?.updatedAt ? <Text style={styles.queueTime}>Checked {formatQueueDate(pushStatus.updatedAt).replace('Saved ', '')}</Text> : null}
          <Button label="Register Push Token" tone="secondary" loading={pushRetrying} onPress={retryPushRegistration} />
        </Card>
        {queuedActions.length ? (
          <Card>
            <Text style={styles.sectionTitle}>Pending Action Details</Text>
            <Text style={styles.helperText}>Ye actions phone me saved hain. Sync now dabane par Google Sheets me upload honge.</Text>
            {queuedActions.map((action) => (
              <View key={action.id} style={styles.queueItem}>
                <Text style={styles.queueTitle}>{getQueueActionTitle(action)}</Text>
                <Text style={styles.queueMeta}>{getQueueActionMeta(action)}</Text>
                <Text style={styles.queueTime}>{formatQueueDate(action.createdAt)}</Text>
                <View style={styles.queueActions}>
                  {action.type === 'settle' && !hasSettlementProof(action) ? (
                    <Button label="Attach Screenshot" tone="secondary" onPress={() => { attachScreenshot(action.id); }} />
                  ) : null}
                  <Button label="Remove Pending" tone="danger" onPress={() => { confirmRemove(action); }} />
                </View>
              </View>
            ))}
            <Button label="Refresh Details" tone="secondary" onPress={() => { refreshQueueDetails(); }} />
          </Card>
        ) : null}
        <Text style={{ height: 12 }} />
        <Button label="Logout" tone="danger" onPress={logout} />
      </ScrollView>
    </Screen>
  );
}

function getQueueActionTitle(action: QueueAction) {
  if (action.type === 'deliver') return `Delivery sync pending · #${action.orderId}`;
  if (action.type === 'fail') return `Failed delivery sync pending · #${action.orderId}`;
  return 'COD payment proof sync pending';
}

function getQueueActionMeta(action: QueueAction) {
  if (action.type === 'deliver') {
    const amount = Number(action.payload.paymentReceivedAmount || action.payload.codCollected || 0);
    const mode = action.payload.paymentReceivedMode || 'Cash';
    const proof = action.payload.photoUri ? ' · proof attached' : '';
    return `${mode} received ₹${amount.toLocaleString('en-IN')}${proof}`;
  }
  if (action.type === 'fail') {
    const proof = action.payload.photoUri ? ' · house proof attached' : '';
    const recording = action.payload.callRecordingUri ? ' · call recording attached' : '';
    return `${action.payload.reason || 'Failed delivery'}${proof}${recording}`;
  }
  const amount = Number(action.payload.amount || 0);
  const ref = action.payload.reference ? ` · Ref ${action.payload.reference}` : '';
  const proof = action.payload.photoUri || action.payload.photoBase64 ? ' · screenshot attached' : ' · screenshot missing';
  return `${action.payload.method} payment ₹${amount.toLocaleString('en-IN')}${ref}${proof}`;
}

function hasSettlementProof(action: QueueAction) {
  return action.type === 'settle' && Boolean(action.payload.photoUri || action.payload.photoBase64);
}

function formatQueueDate(value: string) {
  if (!value) return 'Saved offline';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved offline';
  return `Saved ${date.toLocaleString('en-IN')}`;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  scrollContent: { paddingBottom: 18 },
  avatar: { width: 62, height: 62, borderRadius: 20, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { color: colors.text, fontSize: 26, fontWeight: '900' },
  name: { color: colors.text, fontSize: 24, fontWeight: '900' },
  meta: { color: colors.muted, marginTop: 8, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: 6 },
  helperText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  queueItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 12,
  },
  queueTitle: { color: colors.text, fontSize: 14, fontWeight: '900', lineHeight: 20 },
  queueMeta: { color: colors.muted, marginTop: 4, lineHeight: 19 },
  queueTime: { color: colors.amber, fontSize: 11, fontWeight: '800', marginTop: 6 },
  queueActions: { gap: 10, marginTop: 12 },
  pressed: { opacity: 0.82 },
  themeGrid: { gap: 10 },
  themeOption: { borderWidth: 1, borderRadius: 14, padding: 12 },
  themeSwatches: { flexDirection: 'row', gap: 6, marginBottom: 9 },
  themeSwatch: { width: 22, height: 22, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  themeTitle: { fontSize: 14, fontWeight: '900' },
  themeSub: { marginTop: 3, fontSize: 11, lineHeight: 16 },
  });
}
