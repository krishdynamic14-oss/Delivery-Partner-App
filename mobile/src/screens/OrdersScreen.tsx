import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, DeadlineBadge, Field, Header, Money, Screen } from '../components/ui';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useOrders } from '../state/OrdersContext';
import { getDeadlineLabel, getDeadlineStatus, sortByDeadlinePriority } from '../services/deadlines';
import type { DeliveryOrder, OrderStatus, RootStackParamList } from '../types';

type OrderTab = OrderStatus | 'all' | 'today' | 'tomorrow' | 'plus2' | 'plus3' | 'unplanned';
type TabItem = { key: OrderTab; label: string; subtitle?: string; count: number };

let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}
export function OrdersScreen() {
  useScreenThemeStyles();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<OrderTab>('pending');
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { orders, loading, refresh } = useOrders();
  const normalizedQuery = query.trim().toLowerCase();
  const dateKeys = getPlannedDateKeys();
  const tabItems = getTabItems(orders, dateKeys);
  const activeTab = tabItems.find((item) => item.key === tab) || tabItems[0];
  useEffect(() => {
    if (tab !== 'pending' || !orders.length) return;
    setTab(tabItems.find((item) => item.key === 'unplanned')?.count ? 'unplanned' : 'today');
  }, [orders.length, tab, tabItems]);
  const filtered = sortByDeadlinePriority(getOrdersForTab(orders, tab, dateKeys)
    .filter((order) => {
      if (!normalizedQuery) return true;
      return [
        order.orderNo,
        order.customerName,
        order.area,
        order.product,
        order.phoneMasked,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    }));

  return (
    <Screen>
      <Header title="Orders" subtitle={`${filtered.length} visible · ${tabItems[0].count} today · ${tabItems[1].count} tomorrow`} />
      <Field value={query} onChangeText={setQuery} placeholder="Search order, customer, area, product" />
      <FilterDropdown
        activeTab={activeTab}
        items={tabItems}
        open={filterOpen}
        onToggle={() => setFilterOpen((current) => !current)}
        onSelect={(item) => {
          setTab(item.key);
          setFilterOpen(false);
        }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={refresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No orders match this view.</Text>}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />}
      />
    </Screen>
  );
}

function FilterDropdown({
  activeTab,
  items,
  open,
  onToggle,
  onSelect,
}: {
  activeTab: TabItem;
  items: TabItem[];
  open: boolean;
  onToggle: () => void;
  onSelect: (item: TabItem) => void;
}) {
  return (
    <View style={styles.filterWrap}>
      <Pressable onPress={onToggle} style={styles.filterButton}>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterLabel}>Filter</Text>
          <Text style={styles.filterValue}>
            {activeTab.label}{activeTab.subtitle ? ` · ${activeTab.subtitle}` : ''}
          </Text>
        </View>
        <View style={styles.filterCountPill}>
          <Text style={styles.filterCount}>{activeTab.count}</Text>
        </View>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.filterMenu}>
          {items.map((item) => (
            <Pressable key={item.key} onPress={() => onSelect(item)} style={[styles.filterItem, activeTab.key === item.key && styles.filterItemActive]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.filterItemLabel, activeTab.key === item.key && styles.activeTabText]}>{item.label}</Text>
                {item.subtitle ? <Text style={styles.filterItemSubtitle}>{item.subtitle}</Text> : null}
              </View>
              <Text style={[styles.filterItemCount, activeTab.key === item.key && styles.activeTabText]}>{item.count}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function getOrdersForTab(orders: DeliveryOrder[], tab: OrderTab, dateKeys: ReturnType<typeof getPlannedDateKeys>) {
  if (tab === 'all') return orders;
  if (tab === 'today') return orders.filter((order) => order.status === 'pending' && order.plannedDeliveryDate === dateKeys.today);
  if (tab === 'tomorrow') return orders.filter((order) => order.status === 'pending' && order.plannedDeliveryDate === dateKeys.tomorrow);
  if (tab === 'plus2') return orders.filter((order) => order.status === 'pending' && order.plannedDeliveryDate === dateKeys.plus2);
  if (tab === 'plus3') return orders.filter((order) => order.status === 'pending' && order.plannedDeliveryDate === dateKeys.plus3);
  if (tab === 'unplanned') return orders.filter((order) => order.status === 'pending' && !order.plannedDeliveryDate);
  return orders.filter((order) => order.status === tab);
}

function getTabItems(orders: DeliveryOrder[], dateKeys: ReturnType<typeof getPlannedDateKeys>) {
  const count = (tab: OrderTab) => getOrdersForTab(orders, tab, dateKeys).length;
  return [
    { key: 'today' as const, label: 'TODAY', subtitle: dateKeys.todayLabel, count: count('today') },
    { key: 'tomorrow' as const, label: 'TOMORROW', subtitle: dateKeys.tomorrowLabel, count: count('tomorrow') },
    { key: 'plus2' as const, label: dateKeys.plus2Label.toUpperCase(), count: count('plus2') },
    { key: 'plus3' as const, label: dateKeys.plus3Label.toUpperCase(), count: count('plus3') },
    { key: 'unplanned' as const, label: 'UNPLANNED', count: count('unplanned') },
    { key: 'pending' as const, label: 'PENDING', count: count('pending') },
    { key: 'delivered' as const, label: 'DELIVERED', count: count('delivered') },
    { key: 'failed' as const, label: 'FAILED', count: count('failed') },
    { key: 'all' as const, label: 'ALL', count: count('all') },
  ];
}

function getPlannedDateKeys() {
  const make = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return formatDateForApi(date);
  };
  return {
    today: make(0),
    tomorrow: make(1),
    plus2: make(2),
    plus3: make(3),
    todayLabel: formatDateLabel(new Date()),
    tomorrowLabel: formatDateLabel(addDays(new Date(), 1)),
    plus2Label: formatDateLabel(addDays(new Date(), 2)),
    plus3Label: formatDateLabel(addDays(new Date(), 3)),
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatDateForApi(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function OrderCard({ order, onPress }: { order: DeliveryOrder; onPress: () => void }) {
  const plannedText = order.status === 'pending'
    ? order.plannedDeliveryDate
      ? `Planned: ${order.plannedDeliveryDate}`
      : 'Planned: Not selected'
    : '';
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderNo}>#{order.orderNo}</Text>
            <Text style={styles.address}>{order.address || order.area || 'Address not available'}</Text>
            <Text style={styles.product}>{order.product}</Text>
            {plannedText ? <Text style={styles.plannedDate}>{plannedText}</Text> : null}
            <View style={styles.badgeRow}>
              <Badge label={order.status} tone={order.status} />
              <Badge label={order.paymentType} tone="info" />
              {order.status === 'pending' ? <DeadlineBadge status={getDeadlineStatus(order)} label={getDeadlineLabel(order)} /> : null}
            </View>
          </View>
          <Money value={order.amount} size={20} />
        </View>
      </Card>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  activeTab: { backgroundColor: 'rgba(255,107,0,0.92)', borderColor: colors.orange },
  activeTabText: { color: colors.text },
  filterWrap: { marginBottom: 14 },
  filterButton: { minHeight: 58, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  filterLabel: { color: colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  filterValue: { color: colors.text, fontSize: 16, fontWeight: '900', marginTop: 2 },
  filterCountPill: { minWidth: 38, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,107,0,0.18)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  filterCount: { color: colors.orange, fontWeight: '900' },
  chevron: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  filterMenu: { marginTop: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.surface },
  filterItem: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterItemActive: { backgroundColor: 'rgba(255,107,0,0.92)' },
  filterItemLabel: { color: colors.text, fontSize: 13, fontWeight: '900' },
  filterItemSubtitle: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: 2 },
  filterItemCount: { color: colors.muted, fontSize: 14, fontWeight: '900' },
  listContent: { paddingBottom: 18 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  orderNo: { color: colors.text, fontSize: 16, fontWeight: '900' },
  address: { color: colors.muted, marginTop: 4, marginBottom: 4, lineHeight: 18 },
  product: { color: colors.text, marginBottom: 6 },
  plannedDate: { color: colors.orange, fontSize: 12, fontWeight: '900', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 34 },
});
}
