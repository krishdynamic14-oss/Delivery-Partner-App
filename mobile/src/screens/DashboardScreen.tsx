import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Header, Money, Screen } from '../components/ui';
import { SyncStatusCard } from '../components/SyncStatusCard';
import { colors } from '../theme';
import { useAuth } from '../state/AuthContext';
import { useOrders } from '../state/OrdersContext';
import type { TabParamList } from '../types';

export function DashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { user } = useAuth();
  const { orders, loading, refresh, codSummary } = useOrders();
  const delivered = orders.filter((order) => order.status === 'delivered').length;
  const failed = orders.filter((order) => order.status === 'failed').length;
  const pending = orders.filter((order) => order.status === 'pending').length;

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.orange} />}>
        <Header title={`Namaskar, ${user?.name || 'Partner'}`} subtitle={`${user?.district || 'AHMEDABAD'} · Today`} />
        <SyncStatusCard compact />
        <LinearGradient colors={['rgba(255,107,0,0.24)', 'rgba(255,179,71,0.08)']} style={styles.hero}>
          <Text style={styles.label}>COD collected today</Text>
          <Money value={codSummary.collected} size={34} />
          <Text style={styles.meta}>Remaining ₹{codSummary.remaining.toLocaleString('en-IN')}</Text>
        </LinearGradient>
        <View style={styles.grid}>
          <Metric label="Total" value={orders.length} color={colors.blue} />
          <Metric label="Delivered" value={delivered} color={colors.green} />
          <Metric label="Pending" value={pending} color={colors.amber} />
          <Metric label="Failed" value={failed} color={colors.red} />
        </View>
        <Card>
          <Text style={styles.section}>Next priority</Text>
          <Text style={styles.order}>{orders.find((order) => order.status === 'pending')?.orderNo || 'No pending orders'}</Text>
          <Text style={styles.meta}>Pull down to refresh from Google Sheets when GAS is connected.</Text>
        </Card>
        <View style={styles.actions}>
          <Button label="Start Orders" onPress={() => navigation.navigate('Orders')} />
          <Button label="COD Tracker" tone="secondary" onPress={() => navigation.navigate('COD')} />
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

const styles = StyleSheet.create({
  hero: { borderWidth: 1, borderColor: 'rgba(255,179,71,0.22)', borderRadius: 22, padding: 18, marginBottom: 12, overflow: 'hidden' },
  label: { color: colors.muted, fontSize: 12, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, marginTop: 8, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { fontSize: 28, fontWeight: '900' },
  section: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  order: { color: colors.text, fontSize: 24, fontWeight: '900' },
  actions: { gap: 10, marginBottom: 22 },
});
