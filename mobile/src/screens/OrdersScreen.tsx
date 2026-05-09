import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, Field, Header, Money, Screen } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { DeliveryOrder, OrderStatus, RootStackParamList } from '../types';

export function OrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<OrderStatus | 'all'>('pending');
  const [query, setQuery] = useState('');
  const { orders, loading, refresh } = useOrders();
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = (tab === 'all' ? orders : orders.filter((order) => order.status === tab))
    .filter((order) => {
      if (!normalizedQuery) return true;
      return [
        order.orderNo,
        order.customerName,
        order.area,
        order.product,
        order.phoneMasked,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });

  return (
    <Screen>
      <Header title="Orders" subtitle={`${filtered.length} visible · swipe actions come after MVP validation`} />
      <Field value={query} onChangeText={setQuery} placeholder="Search order, customer, area, product" />
      <View style={styles.tabs}>
        {(['pending', 'delivered', 'failed', 'all'] as const).map((item) => (
          <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.activeTab]}>
            <Text style={[styles.tabText, tab === item && styles.activeTabText]}>{item.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={refresh}
        ListEmptyComponent={<Text style={styles.empty}>No orders match this view.</Text>}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />}
      />
    </Screen>
  );
}

function OrderCard({ order, onPress }: { order: DeliveryOrder; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderNo}>#{order.orderNo}</Text>
            <Text style={styles.area}>{order.customerName} · {order.area}</Text>
            <Text style={styles.product}>{order.product}</Text>
            <View style={styles.badgeRow}>
              <Badge label={order.status} tone={order.status} />
              <Badge label={order.paymentType} tone="info" />
            </View>
          </View>
          <Money value={order.amount} size={20} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab: { paddingVertical: 9, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  activeTab: { backgroundColor: colors.orange, borderColor: colors.orange },
  tabText: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  activeTabText: { color: colors.text },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  orderNo: { color: colors.text, fontSize: 16, fontWeight: '900' },
  area: { color: colors.muted, marginTop: 4, marginBottom: 4 },
  product: { color: colors.text, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 34 },
});
