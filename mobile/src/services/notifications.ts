import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { Partner } from '../types';
import { deactivatePushToken, registerPushToken } from './api';
import { savePushRegistrationStatus } from './storage';

const CHANNEL_ID = 'dynamic-bazar-delivery';

export async function setupPushNotifications(user: Partner): Promise<string | null> {
  if (!Device.isDevice) {
    await savePushStatus('skipped', 'Push notifications work on the installed Android app.');
    return null;
  }
  if (isExpoGo()) {
    await savePushStatus('skipped', 'Push notifications work in the installed APK, not Expo Go.');
    return null;
  }

  const Notifications = await loadNotifications();
  if (!Notifications) {
    await savePushStatus('error', 'Push notifications are not available on this device.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Delivery alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ff6b00',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const permission = await ensureNotificationPermission(Notifications);
  if (!permission) {
    await savePushStatus('skipped', 'Notification permission is off. Enable notifications from Android App Info.');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) {
    await savePushStatus('error', 'Push notification project ID is missing. Contact admin.');
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await registerPushToken({
      expoPushToken: token,
      userId: user.id,
      role: user.role,
      phone: user.phone,
      partnerName: user.name,
      district: user.district,
      platform: Platform.OS,
      deviceName: Device.deviceName || '',
      appVersion: Constants.expoConfig?.version || '',
    }, user.token);
    await savePushStatus('registered', 'Notifications are active for this device.', token);
    return token;
  } catch (err) {
    await savePushStatus('error', getUserSafePushError(err));
    return null;
  }
}

export async function unregisterPushNotifications(expoPushToken: string | null, token?: string): Promise<void> {
  if (!expoPushToken) return;
  try {
    await deactivatePushToken(expoPushToken, token);
  } catch {
    // Logout should not be blocked by a best-effort notification cleanup call.
  }
}

function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';
}

async function loadNotifications() {
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return Notifications;
  } catch {
    return null;
  }
}

async function ensureNotificationPermission(Notifications: NonNullable<Awaited<ReturnType<typeof loadNotifications>>>): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function savePushStatus(status: 'registered' | 'skipped' | 'error', message: string, token?: string) {
  await savePushRegistrationStatus({
    status,
    message,
    tokenPreview: token ? `${token.slice(0, 22)}...` : undefined,
  });
}

function getUserSafePushError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err || '');
  if (/permission|denied/i.test(message)) return 'Notification permission is off. Enable notifications from Android App Info.';
  if (/firebase|fcm|credential|project|server key|Default FirebaseApp/i.test(message)) return 'Push notification service is not configured for this project. Contact admin.';
  if (/network|fetch|internet|timeout/i.test(message)) return 'Could not register notifications. Check internet and try again.';
  return 'Could not register notifications on this device. Try again later.';
}
