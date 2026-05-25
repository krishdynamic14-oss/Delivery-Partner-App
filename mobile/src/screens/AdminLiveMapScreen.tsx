import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Badge, Button, Card, Money, Screen } from '../components/ui';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useOrders } from '../state/OrdersContext';
import { useAuth } from '../state/AuthContext';
import { fetchPartnerLiveLocations } from '../services/api';
import type { DeliveryOrder, PartnerLiveLocation } from '../types';

type LocationFilter = 'all' | 'active' | 'idle' | 'delayed' | 'tracked' | 'missing';

const FILTERS: { key: LocationFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'idle', label: 'Idle' },
  { key: 'delayed', label: 'Delayed' },
  { key: 'tracked', label: 'GPS available' },
  { key: 'missing', label: 'GPS missing' },
];

let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}

export function AdminLiveMapScreen() {
  useScreenThemeStyles();
  const { user } = useAuth();
  const { orders, loading, refresh } = useOrders();
  const [locations, setLocations] = useState<PartnerLiveLocation[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [filter, setFilter] = useState<LocationFilter>('all');

  const loadLocations = useCallback(async () => {
    if (!user?.token) return;
    setLocationLoading(true);
    setLocationError('');
    try {
      setLocations(await fetchPartnerLiveLocations(user.token));
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : 'Location refresh failed.');
    } finally {
      setLocationLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  const postmen = useMemo(() => getPostmen(orders, locations), [orders, locations]);
  const filteredPostmen = useMemo(() => postmen.filter((postman) => {
    if (filter === 'all') return true;
    if (filter === 'tracked') return hasGps(postman);
    if (filter === 'missing') return !hasGps(postman);
    return postman.state.toLowerCase() === filter;
  }), [filter, postmen]);
  const active = postmen.filter((postman) => postman.state === 'Active').length;
  const delayed = postmen.filter((postman) => postman.state === 'Delayed').length;
  const idle = postmen.filter((postman) => postman.state === 'Idle').length;
  const tracked = postmen.filter(hasGps).length;
  const pending = orders.filter((order) => order.status === 'pending').length;
  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), loadLocations()]);
  }, [loadLocations, refresh]);

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={loading || locationLoading} onRefresh={refreshAll} tintColor={colors.orange} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Field Locations</Text>
            <Text style={styles.sub}>{tracked}/{postmen.length} partners sharing GPS · {pending} pending orders</Text>
          </View>
          <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>Live</Text></View>
        </View>

        <View style={styles.summaryGrid}>
          <Metric icon="crosshairs-gps" label="Tracked" value={tracked} color={colors.blue} />
          <Metric icon="moped" label="Active" value={active} color={colors.green} />
          <Metric icon="timer-sand" label="Idle" value={idle} color={colors.muted} />
          <Metric icon="alert-circle-outline" label="Delayed" value={delayed} color={colors.red} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {FILTERS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[styles.filter, filter === item.key && styles.filterActive]}
            >
              <Text style={[styles.filterText, filter === item.key && styles.filterActiveText]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {locationError ? <Card><Text style={[styles.meta, { color: colors.red }]}>{locationError}</Text></Card> : null}

        <Text style={styles.sectionTitle}>Delivery Partners</Text>
        {filteredPostmen.length ? filteredPostmen.map((postman) => <PostmanListItem key={postman.key} postman={postman} />) : (
          <Card><Text style={styles.meta}>No delivery partners match this filter.</Text></Card>
        )}
      </ScrollView>
    </Screen>
  );
}

function Metric({ icon, label, value, color }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: number; color: string }) {
  return (
    <View style={styles.metricTile}>
      <MaterialCommunityIcons name={icon} size={17} color={color} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function PostmanListItem({ postman }: { postman: MapPostman }) {
  const stateColor = getStateColor(postman.state);
  const gpsAvailable = hasGps(postman);
  return (
    <Card>
      <View style={styles.listStack}>
        <View style={styles.listRow}>
          <View style={[styles.listAvatar, { backgroundColor: postman.color }]}>
            <Text style={styles.listAvatarText}>{initials(postman.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{postman.name}</Text>
            <Text style={styles.meta}>{postman.district || 'District not set'} · {postman.pending ? `${postman.pending} pending` : 'No pending orders'}</Text>
            <Text style={styles.meta}>
              {gpsAvailable ? `GPS ${formatLastSeen(postman.lastSeen)}${postman.accuracy ? ` · ${Math.round(postman.accuracy)}m accuracy` : ''}` : 'GPS not received yet'}
            </Text>
          </View>
          <View style={styles.right}>
            <Money value={postman.cod} size={15} />
            <Badge label={postman.state.toLowerCase()} tone={postman.state === 'Delayed' ? 'failed' : postman.state === 'Active' ? 'delivered' : 'pending'} />
          </View>
          <View style={[styles.statusDot, { backgroundColor: gpsAvailable ? colors.blue : stateColor }]} />
        </View>
        {gpsAvailable ? <Button label="Open GPS Location" tone="secondary" onPress={() => openPartnerLocation(postman)} /> : null}
      </View>
    </Card>
  );
}

type MapPostman = {
  key: string;
  name: string;
  district: string;
  state: 'Active' | 'Idle' | 'Delayed';
  delivered: number;
  pending: number;
  cod: number;
  color: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  lastSeen?: string;
  numberMasked?: string;
};

function getPostmen(orders: DeliveryOrder[], locations: PartnerLiveLocation[]) {
  const palette = [colors.orange, colors.blue, colors.green, colors.red, '#8b5cf6', colors.amber];
  const byPartner = new Map<string, MapPostman>();

  orders.forEach((order) => {
    const key = normalizePartnerKey(order.assignedTo, '');
    const current = byPartner.get(key) || {
      key,
      name: order.assignedTo || 'Unassigned',
      district: order.district || '',
      state: 'Idle' as const,
      delivered: 0,
      pending: 0,
      cod: 0,
      color: palette[byPartner.size % palette.length],
    };
    if (!current.district && order.district) current.district = order.district;
    if (order.status === 'delivered') current.delivered += 1;
    if (order.status === 'pending') current.pending += 1;
    if (order.status === 'failed') current.state = 'Delayed';
    if (order.paymentType === 'COD' && order.status === 'delivered') current.cod += order.amount;
    if (current.state !== 'Delayed' && current.pending > 0) current.state = 'Active';
    byPartner.set(key, current);
  });

  locations.forEach((location) => {
    const key = normalizePartnerKey(location.partnerName, location.phone || location.numberMasked);
    const current = byPartner.get(key) || {
      key,
      name: location.partnerName || location.numberMasked || 'Unknown partner',
      district: location.district || '',
      state: 'Idle' as const,
      delivered: 0,
      pending: 0,
      cod: 0,
      color: palette[byPartner.size % palette.length],
    };
    current.latitude = location.latitude;
    current.longitude = location.longitude;
    current.accuracy = location.accuracy;
    current.lastSeen = location.lastSeen;
    current.numberMasked = location.numberMasked;
    if (location.partnerName) current.name = location.partnerName;
    if (location.district) current.district = location.district;
    byPartner.set(key, current);
  });

  return Array.from(byPartner.values()).sort((a, b) => Number(hasGps(b)) - Number(hasGps(a)) || b.pending - a.pending || a.name.localeCompare(b.name));
}

function normalizePartnerKey(name?: string, phone?: string) {
  const phoneKey = String(phone || '').replace(/\D/g, '').slice(-10);
  if (phoneKey) return `phone:${phoneKey}`;
  return `name:${String(name || 'unassigned').trim().toUpperCase()}`;
}

function hasGps(postman: MapPostman) {
  return Boolean(postman.latitude && postman.longitude);
}

function getStateColor(state: MapPostman['state']) {
  if (state === 'Active') return colors.green;
  if (state === 'Delayed') return colors.red;
  return colors.muted;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NA';
}

function openPartnerLocation(postman: MapPostman) {
  if (!postman.latitude || !postman.longitude) {
    Alert.alert('Location missing', 'This partner has not sent a GPS location yet.');
    return;
  }
  const query = `${postman.latitude},${postman.longitude}`;
  void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
}

function formatLastSeen(value?: string) {
  if (!value) return 'time unknown';
  const time = new Date(value).getTime();
  if (!time || Number.isNaN(time)) return value;
  const diff = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} day ago`;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  sub: { color: colors.muted, marginTop: 5, fontSize: 12 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.glass, borderColor: colors.border, borderWidth: 1 },
  liveDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.green },
  liveText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  metricTile: { width: '48%', minHeight: 78, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.glass, padding: 12, marginBottom: 10 },
  metricValue: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 6 },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  filters: { marginHorizontal: -18, paddingHorizontal: 18, marginBottom: 12 },
  filter: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, marginRight: 7 },
  filterActive: { borderColor: colors.orange, backgroundColor: 'rgba(255,107,0,0.13)' },
  filterText: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  filterActiveText: { color: colors.orange },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 10 },
  listStack: { gap: 10 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listAvatarText: { color: colors.text, fontSize: 11, fontWeight: '900' },
  name: { color: colors.text, fontSize: 13, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 99 },
});
}
