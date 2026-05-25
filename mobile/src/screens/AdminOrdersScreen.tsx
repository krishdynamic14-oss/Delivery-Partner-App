import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, DeadlineBadge, Field, Header, Money, Screen } from '../components/ui';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useOrders } from '../state/OrdersContext';
import { useAuth } from '../state/AuthContext';
import { assignOrder, fetchDeliveryPartners } from '../services/api';
import { getDeadlineLabel, getDeadlineStatus, sortByDeadlinePriority } from '../services/deadlines';
import type { DeliveryOrder, DeliveryPartnerSummary, OrderStatus, RootStackParamList } from '../types';


let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}
export function AdminOrdersScreen() {
  useScreenThemeStyles();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [tab, setTab] = useState<OrderStatus | 'all' | 'overdue'>('all');
  const [query, setQuery] = useState('');
  const [partners, setPartners] = useState<DeliveryPartnerSummary[]>([]);
  const [assigningOrderId, setAssigningOrderId] = useState('');
  const { orders, loading, refresh } = useOrders();
  const normalizedQuery = query.trim().toLowerCase();
  const districts = useMemo(() => new Set(orders.map((order) => order.district).filter(Boolean)).size, [orders]);
  const overdueCount = useMemo(() => orders.filter((order) => getDeadlineStatus(order) === 'overdue').length, [orders]);
  const tabOrders = tab === 'all'
    ? orders
    : tab === 'overdue'
      ? orders.filter((order) => getDeadlineStatus(order) === 'overdue')
      : orders.filter((order) => order.status === tab);
  const filtered = sortByDeadlinePriority(tabOrders
    .filter((order) => {
      if (!normalizedQuery) return true;
      return [
        order.orderNo,
        order.customerName,
        order.area,
        order.district,
        order.product,
        order.assignedTo,
        order.phoneMasked,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    }));

  useEffect(() => {
    if (!user?.token) return;
    fetchDeliveryPartners(user.token)
      .then(setPartners)
      .catch(() => setPartners([]));
  }, [user?.token]);

  async function handleAssign(order: DeliveryOrder, partner: DeliveryPartnerSummary) {
    setAssigningOrderId(order.id);
    try {
      await assignOrder(order.id, partner, user?.token);
      Alert.alert('Order assigned', `#${order.orderNo} assigned to ${partner.name}.`);
      await refresh();
    } catch (err) {
      Alert.alert('Assign failed', err instanceof Error ? err.message : 'Could not assign order.');
    } finally {
      setAssigningOrderId('');
    }
  }

  return (
    <Screen>
      <Header title="All Orders" subtitle={`${filtered.length} visible · ${overdueCount} overdue · ${districts} districts`} />
      <Field value={query} onChangeText={setQuery} placeholder="Search order, customer, district, partner" />
      <View style={styles.tabs}>
        {(['all', 'overdue', 'pending', 'delivered', 'failed'] as const).map((item) => (
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
        renderItem={({ item }) => (
          <AdminOrderCard
            order={item}
            partners={partners}
            assigning={assigningOrderId === item.id}
            onAssign={(partner) => handleAssign(item, partner)}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          />
        )}
      />
    </Screen>
  );
}

function AdminOrderCard({
  order,
  partners,
  assigning,
  onAssign,
  onPress,
}: {
  order: DeliveryOrder;
  partners: DeliveryPartnerSummary[];
  assigning: boolean;
  onAssign: (partner: DeliveryPartnerSummary) => void;
  onPress: () => void;
}) {
  return (
    <Card>
      <Pressable onPress={onPress}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderNo}>#{order.orderNo}</Text>
            <Text style={styles.area}>{order.customerName} · {order.district}</Text>
            <Text style={styles.product}>{order.product}</Text>
            <Text style={styles.partner}>{order.assignedTo || 'Not assigned'}</Text>
            <View style={styles.badgeRow}>
              <Badge label={order.status} tone={order.status} />
              <Badge label={order.paymentType} tone="info" />
              {order.status === 'pending' ? <DeadlineBadge status={getDeadlineStatus(order)} label={getDeadlineLabel(order)} /> : null}
            </View>
          </View>
          <Money value={order.amount} size={20} />
        </View>
      </Pressable>
      {order.status === 'pending' ? (
        <View style={styles.assignBlock}>
          <Text style={styles.assignTitle}>{assigning ? 'Assigning...' : 'Quick assign'}</Text>
          <View style={styles.partnerChips}>
            {partners.length ? partners.slice(0, 8).map((partner) => (
              <Pressable
                key={`${partner.name}-${partner.phone || partner.numberMasked || partner.district}`}
                disabled={assigning}
                onPress={() => onAssign(partner)}
                style={({ pressed }) => [styles.partnerChip, pressed && styles.pressed]}
              >
                <Text style={styles.partnerChipText}>{partner.name || 'Partner'}</Text>
                <Text style={styles.partnerChipMeta}>{partner.district || partner.numberMasked || '-'}</Text>
              </Pressable>
            )) : <Text style={styles.partnerEmpty}>No active partners found in DP Master.</Text>}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tab: { paddingVertical: 9, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.glass, borderColor: colors.border, borderWidth: 1 },
  activeTab: { backgroundColor: 'rgba(255,107,0,0.92)', borderColor: colors.orange },
  tabText: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  activeTabText: { color: colors.text },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  orderNo: { color: colors.text, fontSize: 16, fontWeight: '900' },
  area: { color: colors.muted, marginTop: 4, marginBottom: 4 },
  product: { color: colors.text, marginBottom: 6 },
  partner: { color: colors.amber, marginBottom: 10, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', gap: 8 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 34 },
  assignBlock: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', marginTop: 12, paddingTop: 12 },
  assignTitle: { color: colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 9 },
  partnerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  partnerChip: { borderWidth: 1, borderColor: 'rgba(255,179,71,0.28)', backgroundColor: 'rgba(255,179,71,0.1)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  partnerChipText: { color: colors.text, fontSize: 11, fontWeight: '900' },
  partnerChipMeta: { color: colors.muted, fontSize: 9, marginTop: 2 },
  partnerEmpty: { color: colors.muted, fontSize: 12 },
  pressed: { opacity: 0.72 },
});
}
