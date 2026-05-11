import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Header, Money, Screen } from '../components/ui';
import { SyncStatusCard } from '../components/SyncStatusCard';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { AdminTabParamList, DeliveryOrder } from '../types';

export function AdminDashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const { orders, loading, refresh } = useOrders();
  const delivered = orders.filter((order) => order.status === 'delivered').length;
  const failed = orders.filter((order) => order.status === 'failed').length;
  const pending = orders.filter((order) => order.status === 'pending').length;
  const codOrders = orders.filter((order) => order.paymentType === 'COD');
  const collectedCod = codOrders.filter((order) => order.status === 'delivered').reduce((sum, order) => sum + order.amount, 0);
  const assignedCod = codOrders.reduce((sum, order) => sum + order.amount, 0);
  const partnerCount = new Set(orders.map((order) => order.assignedTo).filter(Boolean)).size;
  const topPartners = getTopPartners(orders);

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.orange} />}>
        <Header title="Admin Dashboard" subtitle="All districts · live order monitoring" />
        <SyncStatusCard compact />
        <LinearGradient colors={['rgba(255,107,0,0.26)', 'rgba(78,156,255,0.08)']} style={styles.hero}>
          <Text style={styles.label}>COD collected</Text>
          <Money value={collectedCod} size={34} />
          <Text style={styles.meta}>Assigned COD ₹{assignedCod.toLocaleString('en-IN')}</Text>
        </LinearGradient>
        <View style={styles.grid}>
          <Metric label="Orders" value={orders.length} color={colors.blue} />
          <Metric label="Pending" value={pending} color={colors.amber} />
          <Metric label="Delivered" value={delivered} color={colors.green} />
          <Metric label="Failed" value={failed} color={colors.red} />
        </View>
        <Card>
          <Text style={styles.section}>Field team</Text>
          <Text style={styles.large}>{partnerCount}</Text>
          <Text style={styles.meta}>Assigned delivery partners visible in current Sheet data.</Text>
        </Card>
        <Card>
          <Text style={styles.section}>Top partners</Text>
          {topPartners.length ? topPartners.map((partner) => (
            <View key={partner.name} style={styles.partnerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.partner}>{partner.name}</Text>
                <Text style={styles.meta}>{partner.delivered} delivered · {partner.pending} pending</Text>
              </View>
              <Money value={partner.cod} size={18} />
            </View>
          )) : <Text style={styles.meta}>No partner data found.</Text>}
        </Card>
        <View style={styles.actions}>
          <Button label="View All Orders" onPress={() => navigation.navigate('AdminOrders')} />
          <Button label="COD Overview" tone="secondary" onPress={() => navigation.navigate('AdminCOD')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.metric, { color }]}>{value}</Text>
    </Card>
  );
}

function getTopPartners(orders: DeliveryOrder[]) {
  const byPartner = new Map<string, { name: string; delivered: number; pending: number; cod: number }>();
  orders.forEach((order) => {
    const name = order.assignedTo || 'Unassigned';
    const current = byPartner.get(name) || { name, delivered: 0, pending: 0, cod: 0 };
    if (order.status === 'delivered') current.delivered += 1;
    if (order.status === 'pending') current.pending += 1;
    if (order.status === 'delivered' && order.paymentType === 'COD') current.cod += order.amount;
    byPartner.set(name, current);
  });
  return Array.from(byPartner.values())
    .sort((a, b) => b.delivered - a.delivered || b.cod - a.cod)
    .slice(0, 5);
}

const styles = StyleSheet.create({
  hero: { borderWidth: 1, borderColor: 'rgba(255,179,71,0.22)', borderRadius: 22, padding: 18, marginBottom: 12, overflow: 'hidden' },
  label: { color: colors.muted, fontSize: 12, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, marginTop: 4, fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { fontSize: 28, fontWeight: '900' },
  section: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  large: { color: colors.green, fontSize: 32, fontWeight: '900' },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  partner: { color: colors.text, fontWeight: '900' },
  actions: { gap: 10, marginBottom: 22 },
});
