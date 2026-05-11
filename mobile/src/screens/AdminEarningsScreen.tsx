import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, Card, Money, Screen } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { DeliveryOrder } from '../types';

const RANGE_OPTIONS = [
  { label: 'Today', days: 1 },
  { label: '3D', days: 3 },
  { label: '7D', days: 7 },
  { label: '15D', days: 15 },
  { label: '30D', days: 30 },
];

export function AdminEarningsScreen() {
  const [rangeDays, setRangeDays] = useState(7);
  const [showSettlementReport, setShowSettlementReport] = useState(false);
  const { orders, loading, refresh } = useOrders();
  const codOrders = orders.filter((order) => order.paymentType === 'COD');
  const deliveredCod = codOrders.filter((order) => order.status === 'delivered');
  const pendingCod = codOrders.filter((order) => order.status !== 'delivered');
  const rangeDeliveredCod = deliveredCod.filter((order) => isWithinDays(getOrderCollectionDate(order), rangeDays));
  const todayDeliveredCod = deliveredCod.filter((order) => isWithinDays(getOrderCollectionDate(order), 1));
  const dailyCod = todayDeliveredCod.reduce((sum, order) => sum + order.amount, 0);
  const rangeCod = rangeDeliveredCod.reduce((sum, order) => sum + order.amount, 0);
  const totalAssigned = codOrders.reduce((sum, order) => sum + order.amount, 0);
  const pendingAmount = pendingCod.reduce((sum, order) => sum + order.amount, 0);
  const activePostmen = new Set(orders.map((order) => order.assignedTo).filter(Boolean)).size;
  const target = Math.max(totalAssigned, dailyCod, 1);
  const targetProgress = Math.min(100, Math.round((dailyCod / target) * 100));
  const topPostmen = getTopPostmen(orders);
  const partnerToday = getPartnerDailyReport(orders);
  const buckets = getCollectionBuckets(deliveredCod, rangeDays);
  const peak = Math.max(...buckets.map((bucket) => bucket.amount), 1);

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

        <Pressable onPress={() => setShowSettlementReport((visible) => !visible)} style={({ pressed }) => [styles.settlementCta, pressed && styles.pressed]}>
          <LinearGradient colors={[colors.green, '#009070']} style={styles.ctaIcon}>
            <MaterialCommunityIcons name="wallet-outline" size={22} color={colors.text} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Today's Collection Report</Text>
            <Text style={styles.ctaSub}>Collected ₹{dailyCod.toLocaleString('en-IN')} · Pending ₹{pendingAmount.toLocaleString('en-IN')}</Text>
          </View>
          <MaterialCommunityIcons name={showSettlementReport ? 'chevron-up' : 'chevron-down'} size={22} color={colors.muted} />
        </Pressable>

        {showSettlementReport ? (
          <Card>
            <View style={styles.reportGrid}>
              <Kpi label="Today COD" value={`₹${dailyCod.toLocaleString('en-IN')}`} color={colors.green} />
              <Kpi label="Orders Done" value={todayDeliveredCod.length} color={colors.blue} />
              <Kpi label="Pending COD" value={`₹${pendingAmount.toLocaleString('en-IN')}`} color={colors.amber} />
              <Kpi label="Pending Orders" value={pendingCod.length} color={colors.red} />
            </View>
            <Text style={styles.meta}>Use this report for end-of-day handover. It is calculated from delivered COD orders with today's delivery date.</Text>
          </Card>
        ) : null}

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
            <Text style={styles.sectionTitle}>{rangeDays === 1 ? 'Today' : `${rangeDays}-Day`} COD Collection</Text>
            <Text style={styles.exportText}>₹{rangeCod.toLocaleString('en-IN')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangeTabs}>
            {RANGE_OPTIONS.map((option) => (
              <Pressable key={option.days} onPress={() => setRangeDays(option.days)} style={[styles.rangeTab, rangeDays === option.days && styles.rangeTabActive]}>
                <Text style={[styles.rangeTabText, rangeDays === option.days && styles.rangeTabTextActive]}>{option.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.chart}>
            {buckets.map((bucket) => (
              <View key={bucket.label} style={styles.barCol}>
                <View style={[styles.bar, bucket.amount === peak && styles.barHi, { height: Math.max(18, Math.round((bucket.amount / peak) * 82)) }]} />
                <Text style={styles.barValue}>₹{shortMoney(bucket.amount)}</Text>
                <Text style={styles.barLabel}>{bucket.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitleOutside}>Delivery Partner Today</Text>
        {partnerToday.length ? partnerToday.map((postman) => (
          <PartnerTodayRow key={postman.name} postman={postman} />
        )) : (
          <Card><Text style={styles.meta}>No delivery partner activity visible today.</Text></Card>
        )}

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

function PartnerTodayRow({ postman }: { postman: PartnerDailyReport }) {
  return (
    <Card>
      <View style={styles.pmRow}>
        <View style={[styles.pmAvatar, { backgroundColor: postman.color }]}>
          <Text style={styles.pmAvatarText}>{initials(postman.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pmName}>{postman.name}</Text>
          <Text style={styles.meta}>{postman.deliveredToday} delivered today · {postman.pending} pending now</Text>
        </View>
        <View style={styles.orderRight}>
          <Money value={postman.codToday} size={16} />
          <Badge label={`${postman.pending} pending`} tone={postman.pending ? 'pending' : 'delivered'} />
        </View>
      </View>
    </Card>
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

type PartnerDailyReport = {
  name: string;
  deliveredToday: number;
  pending: number;
  codToday: number;
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

function getPartnerDailyReport(orders: DeliveryOrder[]) {
  const palette = [colors.orange, colors.blue, colors.green, colors.red, '#8b5cf6'];
  const byPostman = new Map<string, PartnerDailyReport>();
  orders.forEach((order) => {
    const name = order.assignedTo || 'Unassigned';
    const current = byPostman.get(name) || { name, deliveredToday: 0, pending: 0, codToday: 0, color: palette[byPostman.size % palette.length] };
    if (order.status === 'pending') current.pending += 1;
    if (order.status === 'delivered' && isWithinDays(getOrderCollectionDate(order), 1)) {
      current.deliveredToday += 1;
      if (order.paymentType === 'COD') current.codToday += order.amount;
    }
    byPostman.set(name, current);
  });
  return Array.from(byPostman.values())
    .filter((postman) => postman.deliveredToday || postman.pending)
    .sort((a, b) => b.deliveredToday - a.deliveredToday || b.codToday - a.codToday || b.pending - a.pending);
}

function getCollectionBuckets(orders: DeliveryOrder[], days: number) {
  const today = startOfDay(new Date());
  return Array.from({ length: days }).map((_, reverseIndex) => {
    const offset = days - reverseIndex - 1;
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const amount = orders
      .filter((order) => isSameDay(getOrderCollectionDate(order), date))
      .reduce((sum, order) => sum + order.amount, 0);
    return { label: days === 1 ? 'Today' : `${date.getDate()}/${date.getMonth() + 1}`, amount };
  });
}

function getOrderCollectionDate(order: DeliveryOrder) {
  return parseSheetDate(order.deliveryDate) || parseSheetDate(order.orderDate) || parseSheetDate(order.updatedAt);
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

function isWithinDays(date: Date | null, days: number) {
  if (!date) return false;
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diff = Math.round((today.getTime() - target.getTime()) / 86400000);
  return diff >= 0 && diff < days;
}

function isSameDay(a: Date | null, b: Date) {
  if (!a) return false;
  const left = startOfDay(a);
  const right = startOfDay(b);
  return left.getTime() === right.getTime();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shortMoney(value: number) {
  if (value >= 100000) return `${Math.round(value / 100000)}L`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
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
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 4 },
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
  rangeTabs: { marginBottom: 12 },
  rangeTab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, marginRight: 7 },
  rangeTabActive: { borderColor: colors.orange, backgroundColor: 'rgba(255,107,0,0.16)' },
  rangeTabText: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  rangeTabTextActive: { color: colors.orange },
  chart: { height: 118, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barCol: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  bar: { width: 18, borderRadius: 8, backgroundColor: colors.orange, opacity: 0.7 },
  barHi: { backgroundColor: colors.amber, opacity: 1 },
  barValue: { color: colors.muted, fontSize: 9, marginTop: 4 },
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
