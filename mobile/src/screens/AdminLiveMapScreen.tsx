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

const FILTERS = ['All', 'Active', 'Idle', 'Delayed', 'Zone A', 'Zone B'] as const;


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
  const loadLocations = useCallback(async () => {
    if (!user?.token) return;
    setLocationLoading(true);
    setLocationError('');
    try {
      setLocations(await fetchPartnerLiveLocations(user.token));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err || 'Location refresh failed');
      setLocationError(message);
    } finally {
      setLocationLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  const postmen = useMemo(() => getPostmen(orders, locations), [orders, locations]);
  const active = postmen.filter((postman) => postman.state === 'Active').length;
  const delayed = postmen.filter((postman) => postman.state === 'Delayed').length;
  const idle = postmen.filter((postman) => postman.state === 'Idle').length;
  const tracked = postmen.filter((postman) => postman.latitude && postman.longitude).length;
  const delivered = orders.filter((order) => order.status === 'delivered').length;
  const pending = orders.filter((order) => order.status === 'pending').length;
  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), loadLocations()]);
  }, [loadLocations, refresh]);

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={loading || locationLoading} onRefresh={refreshAll} tintColor={colors.orange} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Live Map</Text>
            <Text style={styles.sub}>{tracked}/{postmen.length} postmen tracked · {new Set(orders.map((order) => order.district).filter(Boolean)).size} districts</Text>
          </View>
          <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>Live</Text></View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {FILTERS.map((filter, index) => (
            <Pressable key={filter} style={[styles.filter, index === 0 && styles.filterActive]}>
              <Text style={[styles.filterText, index === 0 && styles.filterActiveText]}>{filter}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.mapCanvas}>
          <View style={styles.roadH1} />
          <View style={styles.roadH2} />
          <View style={styles.roadV1} />
          <View style={styles.roadV2} />
          <Zone label="Zone A" left="5%" top="8%" width="38%" height="34%" />
          <Zone label="Zone B" left="50%" top="8%" width="44%" height="34%" />
          <Zone label="Zone C" left="5%" top="50%" width="38%" height="38%" />
          <Zone label="Zone D" left="50%" top="50%" width="44%" height="38%" />
          <Cluster label={`${pending} pending`} left="13%" top="18%" />
          <Cluster label={`${delivered} done`} left="56%" top="14%" />
          <Cluster label={`${delayed} delayed`} left="60%" top="60%" />
          {postmen.slice(0, 8).map((postman, index) => (
            <PostmanDot key={postman.name} postman={postman} index={index} />
          ))}
          <View style={styles.liveCounter}>
            <View style={[styles.liveDot, { backgroundColor: colors.orange }]} />
            <Text style={styles.liveCounterText}>{active} active postmen</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statScroller}>
          <MapChip color={colors.green} label="Active" value={active} />
          <MapChip color={colors.muted} label="Idle" value={idle} />
          <MapChip color={colors.red} label="Delayed" value={delayed} />
          <MapChip color={colors.blue} label="Tracked" value={tracked} icon="crosshairs-gps" />
          <MapChip color={colors.amber} label="Orders out" value={orders.length} icon="package-variant-closed" />
          <MapChip color={colors.green} label="Delivered" value={delivered} icon="check-circle-outline" />
        </ScrollView>

        <Text style={styles.sectionTitle}>Field Team</Text>
        {locationError ? <Card><Text style={[styles.meta, { color: colors.red }]}>{locationError}</Text></Card> : null}
        {postmen.length ? postmen.map((postman) => <PostmanListItem key={postman.name} postman={postman} />) : (
          <Card><Text style={styles.meta}>No assigned postmen visible yet.</Text></Card>
        )}
      </ScrollView>
    </Screen>
  );
}

function Zone({ label, left, top, width, height }: { label: string; left: `${number}%`; top: `${number}%`; width: `${number}%`; height: `${number}%` }) {
  return (
    <View style={[styles.zone, { left, top, width, height }]}>
      <Text style={styles.zoneText}>{label}</Text>
    </View>
  );
}

function Cluster({ label, left, top }: { label: string; left: `${number}%`; top: `${number}%` }) {
  return (
    <View style={[styles.cluster, { left, top }]}>
      <Text style={styles.clusterText}>{label}</Text>
    </View>
  );
}

function PostmanDot({ postman, index }: { postman: MapPostman; index: number }) {
  const positions = [
    ['18%', '23%'], ['60%', '17%'], ['22%', '58%'], ['70%', '64%'],
    ['45%', '42%'], ['34%', '74%'], ['78%', '34%'], ['10%', '70%'],
  ] as const;
  const [left, top] = positions[index % positions.length];
  const stateColor = getStateColor(postman.state);
  return (
    <View style={[styles.pmDot, { left, top }]}>
      <View style={[styles.ping, { borderColor: stateColor }]} />
      <View style={[styles.pmCircle, { backgroundColor: postman.color, borderColor: `${stateColor}aa` }]}>
        <Text style={styles.pmCircleText}>{initials(postman.name)}</Text>
      </View>
      <Text style={[styles.pmDotLabel, { color: stateColor }]} numberOfLines={1}>{postman.shortName} · {postman.delivered} done</Text>
    </View>
  );
}

function MapChip({ color, label, value, icon }: { color: string; label: string; value: number; icon?: keyof typeof MaterialCommunityIcons.glyphMap }) {
  return (
    <View style={styles.mapChip}>
      {icon ? <MaterialCommunityIcons name={icon} size={15} color={color} /> : <View style={[styles.statusDot, { backgroundColor: color }]} />}
      <View>
        <Text style={[styles.mapChipValue, { color }]}>{value}</Text>
        <Text style={styles.mapChipLabel}>{label}</Text>
      </View>
    </View>
  );
}

function PostmanListItem({ postman }: { postman: MapPostman }) {
  const stateColor = getStateColor(postman.state);
  const hasLocation = Boolean(postman.latitude && postman.longitude);
  return (
    <Card>
      <View style={styles.listStack}>
        <View style={styles.listRow}>
          <View style={[styles.listAvatar, { backgroundColor: postman.color }]}>
            <Text style={styles.listAvatarText}>{initials(postman.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{postman.name}</Text>
            <Text style={[styles.meta, postman.state === 'Delayed' && { color: colors.red }]}>
              {postman.zone} · {postman.pending ? `${postman.pending} orders remaining` : 'Route complete'}
            </Text>
            <Text style={styles.meta}>
              {hasLocation ? `Last seen ${formatLastSeen(postman.lastSeen)}${postman.accuracy ? ` · ${Math.round(postman.accuracy)}m accuracy` : ''}` : 'Location not received yet'}
            </Text>
          </View>
          <View style={styles.right}>
            <Money value={postman.cod} size={15} />
            <Badge label={postman.state.toLowerCase()} tone={postman.state === 'Delayed' ? 'failed' : postman.state === 'Active' ? 'delivered' : 'pending'} />
          </View>
          <View style={[styles.statusDot, { backgroundColor: hasLocation ? colors.blue : stateColor }]} />
        </View>
        {hasLocation ? <Button label="Open in Google Maps" tone="secondary" onPress={() => openPartnerLocation(postman)} /> : null}
      </View>
    </Card>
  );
}

type MapPostman = {
  name: string;
  shortName: string;
  zone: string;
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
  const byName = new Map<string, MapPostman>();
  orders.forEach((order) => {
    const name = order.assignedTo || 'Unassigned';
    const current = byName.get(name) || {
      name,
      shortName: name.split(/\s+/)[0] || 'Team',
      zone: zoneFromDistrict(order.district),
      state: 'Idle' as const,
      delivered: 0,
      pending: 0,
      cod: 0,
      color: palette[byName.size % palette.length],
    };
    if (order.status === 'delivered') current.delivered += 1;
    if (order.status === 'pending') current.pending += 1;
    if (order.status === 'failed') current.state = 'Delayed';
    if (order.paymentType === 'COD' && order.status === 'delivered') current.cod += order.amount;
    if (current.state !== 'Delayed' && current.pending > 0) current.state = 'Active';
    byName.set(name, current);
  });
  locations.forEach((location) => {
    const key = location.partnerName || location.numberMasked || location.phone || 'Unknown';
    const existing = byName.get(key);
    const current = existing || {
      name: key,
      shortName: key.split(/\s+/)[0] || 'Team',
      zone: zoneFromDistrict(location.district),
      state: 'Idle' as const,
      delivered: 0,
      pending: 0,
      cod: 0,
      color: palette[byName.size % palette.length],
    };
    current.latitude = location.latitude;
    current.longitude = location.longitude;
    current.accuracy = location.accuracy;
    current.lastSeen = location.lastSeen;
    current.numberMasked = location.numberMasked;
    byName.set(key, current);
  });
  return Array.from(byName.values()).sort((a, b) => b.pending - a.pending || b.delivered - a.delivered);
}

function zoneFromDistrict(district: string) {
  const first = (district || 'A').trim()[0]?.toUpperCase() || 'A';
  if (first <= 'F') return 'Zone A';
  if (first <= 'L') return 'Zone B';
  if (first <= 'R') return 'Zone C';
  return 'Zone D';
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
  if (!value) return 'unknown';
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
  filters: { marginHorizontal: -18, paddingHorizontal: 18, marginBottom: 12 },
  filter: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, marginRight: 7 },
  filterActive: { borderColor: colors.orange, backgroundColor: 'rgba(255,107,0,0.13)' },
  filterText: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  filterActiveText: { color: colors.orange },
  mapCanvas: { position: 'relative', height: 430, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: '#0a0a18', marginBottom: 12 },
  roadH1: { position: 'absolute', top: '38%', left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  roadH2: { position: 'absolute', top: '62%', left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  roadV1: { position: 'absolute', left: '30%', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  roadV2: { position: 'absolute', left: '65%', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  zone: { position: 'absolute', borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(78,156,255,0.23)', backgroundColor: 'rgba(78,156,255,0.05)', alignItems: 'flex-end', padding: 8 },
  zoneText: { color: 'rgba(78,156,255,0.55)', fontSize: 9, fontWeight: '900' },
  cluster: { position: 'absolute', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,179,71,0.36)', backgroundColor: 'rgba(255,179,71,0.15)' },
  clusterText: { color: colors.amber, fontSize: 10, fontWeight: '900' },
  pmDot: { position: 'absolute', alignItems: 'center', gap: 3, zIndex: 5 },
  ping: { position: 'absolute', width: 44, height: 44, top: -6, borderRadius: 99, borderWidth: 1, opacity: 0.45 },
  pmCircle: { width: 32, height: 32, borderRadius: 99, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  pmCircleText: { color: colors.text, fontSize: 10, fontWeight: '900' },
  pmDotLabel: { maxWidth: 92, backgroundColor: 'rgba(10,10,24,0.88)', borderColor: colors.border, borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, fontSize: 9, fontWeight: '900', overflow: 'hidden' },
  liveCounter: { position: 'absolute', top: 10, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,107,0,0.32)', backgroundColor: 'rgba(10,10,24,0.88)' },
  liveCounterText: { color: colors.orange, fontSize: 11, fontWeight: '900' },
  statScroller: { marginHorizontal: -18, paddingHorizontal: 18, marginBottom: 14 },
  mapChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, marginRight: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 99 },
  mapChipValue: { fontSize: 12, fontWeight: '900' },
  mapChipLabel: { color: colors.muted, fontSize: 9 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 10 },
  listStack: { gap: 10 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listAvatarText: { color: colors.text, fontSize: 11, fontWeight: '900' },
  name: { color: colors.text, fontSize: 13, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 5 },
});
}
