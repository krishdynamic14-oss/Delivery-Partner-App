import * as Location from 'expo-location';
import Constants from 'expo-constants';
import type { Partner } from '../types';
import { updatePartnerLocation } from './api';

const MIN_UPDATE_INTERVAL_MS = 120000;
let lastSubmittedAt = 0;

export async function submitCurrentLocation(user: Partner | null, options?: { force?: boolean }) {
  if (!user?.token || user.role !== 'partner') return { skipped: true, reason: 'not_partner' };
  const now = Date.now();
  if (!options?.force && now - lastSubmittedAt < MIN_UPDATE_INTERVAL_MS) {
    return { skipped: true, reason: 'throttled' };
  }

  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') return { skipped: true, reason: 'permission_denied' };

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const timestamp = await updatePartnerLocation({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    speed: position.coords.speed,
    heading: position.coords.heading,
    appVersion: Constants.expoConfig?.version || '',
    source: 'mobile-app',
  }, user.token);
  lastSubmittedAt = Date.now();
  return { skipped: false, timestamp: timestamp.timestamp };
}
