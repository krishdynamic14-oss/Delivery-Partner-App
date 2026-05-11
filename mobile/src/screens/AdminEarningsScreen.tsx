import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, Card, Money, Screen } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { AdminTabParamList, DeliveryOrder } from '../types';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AdminEarningsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const { orders, loading, refresh } = useOrders();
  const codOrders = orders.filter((order) => order.paymentType === 'COD');
  const deliveredCod = codOrders.filter((order) => order.status === 'delivered');
  const pendingCod = codOrders.filter((order) => order.status !== 'delivered');
  const dailyCod = deliveredCod.reduce((sum, order) => sum + order.amount, 0);
  const totalAssigned = codOrders.reduce((sum, order) => sum + order.amount, 0);
  const pendingAmount = pendingCod.reduce((sum, order) => sum + order.amount, 0);
  const activePostmen = new Set(orders.map((order) => order.assignedTo).filter(Boolean)).size;
  const target = Math.max(totalAssigned, dailyCod, 1);
  const targetProgress = Math.min(100, Math.round((dailyCod / target) * 100));
  const topPostmen = getTopPostmen(orders);
  const weekly = getWeeklyBuckets(deliveredCod);
  const peak = Math.max(...weekly, 1);

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.orange} />}>
        <LinearGradient colors={['rgba(255,107,0,0.22)', 'rgba(255,179,71,0.08)', 'transparent']} style={styles.hero}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Earnings Dashboard</Text>
              <Text style={styles.sub}>Admin view · {new Date().toLocaleDateString('en-IN')}</Text>
            </View>
            <View style={styles.iconButton}>
              <MaterialCommunityIcons name="file-chart-outline" size={20} color={colors.amber} />
            </View>
          </View>

          <View style={styles.kpiGrid}>
            <Kpi label="Daily COD" value={`₹${dailyCod.toLocaleString('en-IN')}`} color={colors.amber} />
            <Kpi label="Total Assigned" value={`₹${totalAssigned.toLocaleString('en-IN')}`} color={colors.green} />
            <Kpi label="Pending" value={`₹${pendingAmount.toLocaleString('en-IN')}`} color={colors.red} />
            <Kpi label="Active Postmen" value={activePostmen} color={colors.blue} />
          </View>
        </LinearGradient>

        <Pressable onPress={() => navigation.navigate('AdminProfile')} style={({ pressed }) => [styles.settlementCta, pressed && styles.pressed]}>
          <LinearGradient colors={[colors.green, '#009070']} style={styles.ctaIcon}>
            <MaterialCommunityIcons name="wallet-outline" size={22} color={colors.text} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>End-of-Day Settlement</Text>
            <Text style={styles.ctaSub}>Pending COD handover · ₹{pendingAmount.toLocaleString('en-IN')}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />
        </Pressable>

        <Card>
          <View style={styles.targetTop}>
            <Text style={styles.sectionTitle}>Collection Progress</Text>
            <Text style={styles.progressText}>{targetProgress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${targetProgress}%` }]} />
          </View>
          <View style={styles.targetBottom}>
            <Text style={styles.meta}>Collected ₹{dailyCod.toLocaleString('en-IN')}</Text>
            <Text style={styles.meta}>Assigned ₹{target.toLocaleString('en-IN')}</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>7-Day COD Collection</Text>
            <Text style={styles.exportText}>Live Sheet</Text>
          </View>
          <View style={styles.chart}>
            {weekly.map((value, index) => (
              <View key={WEEK_DAYS[index]} style={styles.barCol}>
                <View style={[styles.bar, value === peak && styles.barHi, { height: Math.max(18, Math.round((value / peak) * 82)) }]} />
                <Text style={styles.barLabel}>{WEEK_DAYS[index]}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitleOutside}>Top Postmen</Text>
        {topPostmen.length ? topPostmen.map((postman, index) => (
          <PostmanRow key={postman.name} rank={index + 1} postman={postman} />
        )) : (
          <Card><Text style={styles.meta}>No postman earnings visible yet.</Text></Card>
        )}

        <Text style={styles.sectionTitleOutside}>Recent COD Orders</Text>
        {deliveredCod.slice(0, 4).map((order) => (
          <Card key={order.id}>
            <View style={styles.orderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNo}>#{order.orderNo} · {order.assignedTo || 'Unassigned'}</Text>
                <Text style={styles.meta}>{order.customerName} · {order.district}</Text>
              </View>
              <View style={styles.orderRight}>
                <Money value={order.amount} size={17} />
                <Badge label="collected" tone="delivered" />
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

function Kpi({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={styles.kpiBox}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </View>
  );
}

function PostmanRow({ rank, postman }: { rank: number; postman: PostmanEarning }) {
  return (
    <Card>
      <View style={styles.pmRow}>
        <Text style={[styles.rank, rank === 1 && styles.rankTop]}>#{rank}</Text>
        <View style={[styles.pmAvatar, { backgroundColor: postman.color }]}>
          <Text style={styles.pmAvatarText}>{initials(postman.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pmName}>{postman.name}</Text>
          <Text style={styles.meta}>{postman.delivered} delivered · {postman.pending} pending</Text>
        </View>
        <Money value={postman.cod} size={17} />
      </View>
    </Card>
  );
}

type PostmanEarning = {
  name: string;
  delivered: number;
  pending: number;
  cod: number;
  color: string;
};

function getTopPostmen(orders: DeliveryOrder[]) {
  const palette = [colors.orange, colors.blue, colors.green, colors.red, '#8b5cf6'];
  const byPostman = new Map<string, PostmanEarning>();
  orders.forEach((order) => {
    const name = order.assignedTo || 'Unassigned';
    const current = byPostman.get(name) || { name, delivered: 0, pending: 0, cod: 0, color: palette[byPostman.size % palette.length] };
    if (order.status === 'delivered') current.delivered += 1;
    if (order.status !== 'delivered') current.pending += 1;
    if (order.status === 'delivered' && order.paymentType === 'COD') current.cod += order.amount;
    byPostman.set(name, current);
  });
  return Array.from(byPostman.values())
    .sort((a, b) => b.cod - a.cod || b.delivered - a.delivered)
    .slice(0, 5);
}

function getWeeklyBuckets(orders: DeliveryOrder[]) {
  const total = orders.reduce((sum, order) => sum + order.amount, 0);
  if (!total) return [0, 0, 0, 0, 0, 0, 0];
  return [0.13, 0.16, 0.11, 0.2, 0.14, 0.17, 0.09].map((share) => Math.round(total * share));
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NA';
}

const styles = StyleSheet.create({
  hero: { marginHorizontal: -18, marginTop: -56, paddingHorizontal: 18, paddingTop: 56, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { color: colors.text, fontSize: 25, fontWeight: '900' },
  sub: { color: colors.muted, marginTop: 5, fontSize: 12 },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  kpiBox: { width: '48%', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, backgroundColor: colors.dim, marginBottom: 10 },
  kpiLabel: { color: colors.muted, fontSize: 10, textTransform: 'uppercase', fontWeight: '900', marginBottom: 5 },
  kpiValue: { fontSize: 18, fontWeight: '900' },
  settlementCta: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,200,150,0.22)', backgroundColor: 'rgba(0,200,150,0.1)', marginTop: 14, marginBottom: 12 },
  pressed: { opacity: 0.75 },
  ctaIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctaTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  ctaSub: { color: colors.muted, marginTop: 3, fontSize: 11 },
  targetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  sectionTitleOutside: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 10, marginTop: 4 },
  progressText: { color: colors.green, fontSize: 20, fontWeight: '900' },
  progressBar: { height: 9, borderRadius: 99, backgroundColor: colors.dim, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.green },
  targetBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  meta: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  exportText: { color: colors.orange, fontSize: 11, fontWeight: '800' },
  chart: { height: 118, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barCol: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  bar: { width: 18, borderRadius: 8, backgroundColor: colors.orange, opacity: 0.7 },
  barHi: { backgroundColor: colors.amber, opacity: 1 },
  barLabel: { color: colors.muted, fontSize: 10, marginTop: 7 },
  pmRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rank: { color: colors.muted, width: 26, fontWeight: '900' },
  rankTop: { color: colors.amber },
  pmAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pmAvatarText: { color: colors.text, fontSize: 11, fontWeight: '900' },
  pmName: { color: colors.text, fontSize: 13, fontWeight: '900' },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderNo: { color: colors.text, fontWeight: '900', marginBottom: 5 },
  orderRight: { alignItems: 'flex-end', gap: 6 },
});
