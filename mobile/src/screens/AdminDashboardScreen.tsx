import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, Card, Money, Screen } from '../components/ui';
import { SyncStatusCard } from '../components/SyncStatusCard';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useOrders } from '../state/OrdersContext';
import { getDeadlineStatus } from '../services/deadlines';
import type { AdminTabParamList, DeliveryOrder } from '../types';


let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}
export function AdminDashboardScreen() {
  useScreenThemeStyles();
  const navigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const { orders, loading, refresh } = useOrders();
  const todayOrders = orders.filter((order) => isToday(parseSheetDate(order.orderDate) || parseSheetDate(order.deliveryDate)));
  const delivered = orders.filter((order) => order.status === 'delivered').length;
  const failed = orders.filter((order) => order.status === 'failed').length;
  const pending = orders.filter((order) => order.status === 'pending').length;
  const overdue = orders.filter((order) => getDeadlineStatus(order) === 'overdue').length;
  const codOrders = orders.filter((order) => order.paymentType === 'COD');
  const collectedCod = codOrders.filter((order) => order.status === 'delivered').reduce((sum, order) => sum + order.amount, 0);
  const assignedCod = codOrders.reduce((sum, order) => sum + order.amount, 0);
  const partnerCount = new Set(orders.map((order) => order.assignedTo).filter(Boolean)).size;
  const recentActivity = getRecentActivity(orders);
  const performanceScore = orders.length ? Math.round((delivered / orders.length) * 100) : 0;

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.orange} />}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.avatar}><Image source={require('../../assets/icon.png')} style={styles.logoImage} /></View>
            <View>
              <Text style={styles.hqTitle}>Dynamic Bazar Admin</Text>
              <Text style={styles.hqSub}>Admin Panel</Text>
            </View>
          </View>
          <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>Live</Text></View>
        </View>

        <View style={styles.stockAlert}>
          <MaterialCommunityIcons name="alert" size={16} color={colors.amber} />
          <Text style={styles.stockText}>{overdue} overdue · {failed} failed/RTO needs review</Text>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Operations Overview</Text>
          <Text style={styles.greetingSub}>Dynamic Bazar operations · {new Date().toLocaleDateString('en-IN')}</Text>
        </View>

        <LinearGradient colors={['rgba(255,107,0,0.34)', 'rgba(255,179,71,0.12)', 'rgba(18,18,27,0.88)']} style={styles.hero}>
          <Text style={styles.heroLabel}>Delivered COD</Text>
          <Money value={collectedCod} size={38} />
          <Text style={styles.trend}>Assigned ₹{assignedCod.toLocaleString('en-IN')} · {codOrders.length} COD orders</Text>
        </LinearGradient>

        <View style={styles.grid}>
          <Metric icon="package-variant-closed" label="Today's Orders" value={todayOrders.length} color={colors.blue} sub={`${orders.length} total orders`} />
          <Metric icon="moped" label="Active Partners" value={partnerCount} color={colors.green} sub={`${pending} pending`} />
          <Metric icon="speedometer" label="Performance" value={`${performanceScore}%`} color={colors.amber} sub="Live from Sheet" />
          <Metric icon="calendar-alert" label="Overdue" value={overdue} color={colors.red} sub="Past planned date" />
        </View>

        <View style={styles.quickGrid}>
          <QuickAction icon="account-plus-outline" title="Assign Orders" subtitle={`${pending} pending`} color={colors.orange} onPress={() => navigation.navigate('AdminOrders')} />
          <QuickAction icon="map-marker-radius-outline" title="Live Map" subtitle={`${partnerCount} active`} color={colors.blue} onPress={() => navigation.navigate('AdminMap')} />
          <QuickAction icon="wallet-outline" title="Settlement" subtitle="EOD handover" color={colors.green} onPress={() => navigation.navigate('AdminEarnings')} />
          <QuickAction icon="chart-bar" title="Earnings" subtitle={`₹${collectedCod.toLocaleString('en-IN')}`} color="#8b5cf6" onPress={() => navigation.navigate('AdminEarnings')} />
          <QuickAction icon="warehouse" title="Stock" subtitle={`${failed} alerts`} color={colors.red} onPress={() => navigation.navigate('AdminStock')} />
        </View>

        <Text style={styles.sectionTitle}>Live Activity</Text>
        {recentActivity.length ? recentActivity.map((order) => <ActivityRow key={order.id} order={order} />) : (
          <Card><Text style={styles.meta}>No activity visible yet.</Text></Card>
        )}
        <SyncStatusCard compact />
      </ScrollView>
    </Screen>
  );
}

function Metric({ icon, label, value, color, sub }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: number | string; color: string; sub: string }) {
  return (
    <View style={styles.metricTile}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}22` }]}>
        <MaterialCommunityIcons name={icon} size={17} color={color} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.metric, { color }]}>{value}</Text>
      <Text style={styles.metricSub}>{sub}</Text>
    </View>
  );
}

function QuickAction({ icon, title, subtitle, color, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; subtitle: string; color: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]}>
      <LinearGradient colors={[color, `${color}aa`]} style={styles.quickIcon}>
        <MaterialCommunityIcons name={icon} size={19} color={colors.text} />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickSub}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

function ActivityRow({ order }: { order: DeliveryOrder }) {
  const tone = order.status === 'delivered' ? colors.green : order.status === 'failed' ? colors.red : colors.amber;
  const icon = order.status === 'delivered' ? 'check-circle-outline' : order.status === 'failed' ? 'backup-restore' : 'truck-delivery-outline';
  return (
    <Card>
      <View style={styles.activityRow}>
        <View style={[styles.activityIcon, { backgroundColor: `${tone}22` }]}>
          <MaterialCommunityIcons name={icon} size={18} color={tone} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.activityOrder}>#{order.orderNo}</Text>
          <Text style={styles.activityMeta}>{order.district} · {order.assignedTo || 'Unassigned'}</Text>
        </View>
        <View style={styles.activityRight}>
          <Money value={order.amount} size={15} />
          <Badge label={order.status} tone={order.status} />
        </View>
      </View>
    </Card>
  );
}

function getRecentActivity(orders: DeliveryOrder[]) {
  return [...orders]
    .sort((a, b) => {
      const statusRank = { delivered: 3, failed: 2, pending: 1 };
      return statusRank[b.status] - statusRank[a.status];
    })
    .slice(0, 5);
}

function parseSheetDate(value?: string) {
  if (!value) return null;
  const raw = String(value).trim();
  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (dmy) {
    const year = Number(dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]);
    return new Date(year, Number(dmy[2]) - 1, Number(dmy[1]));
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isToday(date: Date | null) {
  if (!date) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  logoImage: { width: 42, height: 42, resizeMode: 'contain' },
  hqTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  hqSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.glass, borderColor: colors.border, borderWidth: 1 },
  liveDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.green },
  liveText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  stockAlert: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: 'rgba(255,179,71,0.14)', borderColor: 'rgba(255,179,71,0.32)', borderWidth: 1, marginBottom: 14 },
  stockText: { color: colors.amber, fontWeight: '900', fontSize: 12 },
  greeting: { marginBottom: 16 },
  greetingTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },
  greetingSub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  hero: { borderWidth: 1, borderColor: 'rgba(255,179,71,0.22)', borderRadius: 24, padding: 20, marginBottom: 12, overflow: 'hidden' },
  heroLabel: { color: colors.muted, fontSize: 12, textTransform: 'uppercase', fontWeight: '900', marginBottom: 8 },
  trend: { color: colors.green, marginTop: 10, fontSize: 12, fontWeight: '800' },
  label: { color: colors.muted, fontSize: 12, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, marginTop: 4, fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 4 },
  metricTile: { width: '48%', minHeight: 138, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, marginBottom: 10 },
  metricIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  metric: { fontSize: 26, fontWeight: '900' },
  metricSub: { color: colors.muted, fontSize: 11, marginTop: 3 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 },
  quickTile: { width: '48%', minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, marginBottom: 10 },
  pressed: { opacity: 0.72 },
  quickIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { color: colors.text, fontWeight: '900', fontSize: 12 },
  quickSub: { color: colors.muted, fontSize: 10, marginTop: 3 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 10, marginTop: 2 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  activityOrder: { color: colors.text, fontSize: 13, fontWeight: '900' },
  activityMeta: { color: colors.muted, fontSize: 11, marginTop: 4 },
  activityRight: { alignItems: 'flex-end', gap: 5 },
});
}
