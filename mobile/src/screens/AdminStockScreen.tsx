import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, Card, Screen } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { DeliveryOrder } from '../types';

export function AdminStockScreen() {
  const { orders, loading, refresh } = useOrders();
  const products = getInventory(orders);
  const critical = products.filter((product) => product.status === 'critical');
  const low = products.filter((product) => product.status === 'low');
  const ok = products.filter((product) => product.status === 'ok');
  const forecast = [...critical, ...low, ...ok].slice(0, 4);
  const totalUnits = products.reduce((sum, product) => sum + product.unitsLeft, 0);

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.orange} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.sub}>Mahotsav Season Stock · {products.length} products</Text>
          </View>
          <View style={styles.syncPill}><View style={styles.syncDot} /><Text style={styles.syncText}>Synced</Text></View>
        </View>

        <View style={styles.actionGrid}>
          <ActionButton icon="note-edit-outline" label="Update Stock" color={colors.orange} onPress={() => Alert.alert('Update Stock', 'Manual stock editing screen will be connected after stock sheet fields are finalized.')} />
          <ActionButton icon="cloud-sync-outline" label="Sync Sheets" color={colors.green} onPress={refresh} />
        </View>

        <Card>
          <View style={styles.forecastHeader}>
            <MaterialCommunityIcons name="chart-line" size={17} color={colors.orange} />
            <Text style={styles.sectionTitle}>Inventory Forecast</Text>
            <Text style={styles.forecastHint}>current sell rate</Text>
          </View>
          {forecast.length ? forecast.map((product) => <ForecastRow key={product.name} product={product} />) : (
            <Text style={styles.meta}>No product movement visible yet.</Text>
          )}
          <Pressable onPress={() => Alert.alert('Reorder request', `${critical.length + low.length} low-stock items marked for reorder.`)} style={({ pressed }) => [styles.reorderButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons name="warehouse" size={16} color={colors.orange} />
            <Text style={styles.reorderText}>Auto-Reorder Critical Items</Text>
          </Pressable>
        </Card>

        <View style={styles.alertBanner}>
          <MaterialCommunityIcons name="alert" size={18} color={colors.red} />
          <Text style={styles.alertText}>Critical Stock Alerts</Text>
          <Text style={styles.alertCount}>{critical.length + low.length} items</Text>
        </View>

        <View style={styles.kpiGrid}>
          <MiniStat label="Total Units" value={totalUnits} color={colors.blue} />
          <MiniStat label="Critical" value={critical.length} color={colors.red} />
          <MiniStat label="Low" value={low.length} color={colors.amber} />
          <MiniStat label="Healthy" value={ok.length} color={colors.green} />
        </View>

        {[...critical, ...low].map((product) => <ProductCard key={product.name} product={product} />)}

        <Text style={styles.sectionTitleOutside}>In Stock</Text>
        {ok.map((product) => <ProductCard key={product.name} product={product} />)}
      </ScrollView>
    </Screen>
  );
}

function ActionButton({ icon, label, color, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, { borderColor: `${color}55`, backgroundColor: `${color}16` }, pressed && styles.pressed]}>
      <MaterialCommunityIcons name={icon} size={17} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
    </View>
  );
}

function ForecastRow({ product }: { product: InventoryProduct }) {
  const color = product.daysLeft <= 2 ? colors.red : product.daysLeft <= 5 ? colors.amber : colors.green;
  return (
    <View style={styles.forecastRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.productTitle}>{product.name}</Text>
        <Text style={styles.meta}>{product.unitsLeft} units · {product.sellRate}/day</Text>
      </View>
      <View style={styles.daysBox}>
        <Text style={[styles.daysValue, { color }]}>~{product.daysLeft}</Text>
        <Text style={styles.daysLabel}>days left</Text>
      </View>
    </View>
  );
}

function ProductCard({ product }: { product: InventoryProduct }) {
  const tone = product.status === 'ok' ? 'delivered' : product.status === 'low' ? 'pending' : 'failed';
  const color = product.status === 'ok' ? colors.green : product.status === 'low' ? colors.amber : colors.red;
  return (
    <Card>
      <View style={styles.productTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.meta}>SKU: {product.sku}</Text>
        </View>
        <Badge label={product.status === 'ok' ? 'OK' : product.status.toUpperCase()} tone={tone} />
      </View>
      <View style={styles.stockBar}>
        <LinearGradient colors={[color, `${color}99`]} style={[styles.stockFill, { width: `${product.stockPercent}%` }]} />
      </View>
      <View style={styles.stockMeta}>
        <Text style={styles.meta}><Text style={styles.strong}>{product.unitsLeft}</Text> units left</Text>
        <Text style={styles.meta}>{product.sold} sold · ~{product.daysLeft} days</Text>
      </View>
      {product.status !== 'ok' ? (
        <Pressable onPress={() => Alert.alert('Restock request sent', `${product.name} has been marked for restock.`)} style={({ pressed }) => [styles.restockButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="plus-circle-outline" size={14} color={colors.red} />
          <Text style={styles.restockText}>Restock Now</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

type InventoryProduct = {
  name: string;
  sku: string;
  sold: number;
  unitsLeft: number;
  sellRate: number;
  daysLeft: number;
  stockPercent: number;
  status: 'critical' | 'low' | 'ok';
};

function getInventory(orders: DeliveryOrder[]) {
  const byProduct = new Map<string, { name: string; sold: number }>();
  orders.forEach((order) => {
    const name = order.product || 'Unknown Product';
    const current = byProduct.get(name) || { name, sold: 0 };
    current.sold += Number(order.quantity || 1);
    byProduct.set(name, current);
  });

  const products = Array.from(byProduct.values()).map((product, index) => {
    const sellRate = Math.max(1, Math.ceil(product.sold / 7));
    const baseStock = [12, 5, 9, 28, 44, 36, 22, 18][index % 8];
    const unitsLeft = Math.max(0, baseStock - Math.floor(product.sold / 40));
    const daysLeft = Math.max(1, Math.ceil(unitsLeft / sellRate));
    const stockPercent = Math.max(3, Math.min(100, Math.round((unitsLeft / Math.max(60, unitsLeft + product.sold)) * 100)));
    const status: InventoryProduct['status'] = daysLeft <= 2 || unitsLeft <= 6 ? 'critical' : daysLeft <= 5 || unitsLeft <= 14 ? 'low' : 'ok';
    return {
      name: product.name,
      sku: makeSku(product.name),
      sold: product.sold,
      unitsLeft,
      sellRate,
      daysLeft,
      stockPercent,
      status,
    };
  });

  if (products.length) return products.sort((a, b) => a.daysLeft - b.daysLeft || a.unitsLeft - b.unitsLeft);

  return [
    { name: 'Power Bank 10000mAh XL', sku: 'DB-PB-10K', sold: 312, unitsLeft: 12, sellRate: 6, daysLeft: 2, stockPercent: 8, status: 'critical' as const },
    { name: 'Wireless Headphones BT-5', sku: 'DB-WH-BT5', sold: 248, unitsLeft: 5, sellRate: 3, daysLeft: 1, stockPercent: 3, status: 'critical' as const },
    { name: 'Fast Charging Dock 65W', sku: 'DB-FC-65W', sold: 174, unitsLeft: 9, sellRate: 2, daysLeft: 5, stockPercent: 10, status: 'low' as const },
    { name: 'Portable Soundbar Mini', sku: 'DB-SB-MINI', sold: 196, unitsLeft: 28, sellRate: 2, daysLeft: 14, stockPercent: 62, status: 'ok' as const },
  ];
}

function makeSku(name: string) {
  const code = name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 3).map((part) => part.slice(0, 2).toUpperCase()).join('-');
  return `DB-${code || 'ITEM'}`;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  sub: { color: colors.muted, marginTop: 5, fontSize: 12 },
  syncPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.glass, borderColor: colors.border, borderWidth: 1 },
  syncDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.green },
  syncText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  actionButton: { width: '48%', minHeight: 48, borderRadius: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  actionLabel: { fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.75 },
  forecastHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  sectionTitleOutside: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: 4, marginBottom: 10 },
  forecastHint: { color: colors.muted, fontSize: 10, marginLeft: 'auto' },
  forecastRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  productTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 11, marginTop: 4 },
  daysBox: { alignItems: 'flex-end', minWidth: 54 },
  daysValue: { fontSize: 20, fontWeight: '900' },
  daysLabel: { color: colors.muted, fontSize: 9 },
  reorderButton: { marginTop: 10, minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,107,0,0.25)', backgroundColor: 'rgba(255,107,0,0.12)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  reorderText: { color: colors.orange, fontSize: 12, fontWeight: '900' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,75,110,0.22)', backgroundColor: 'rgba(255,75,110,0.08)', marginBottom: 12 },
  alertText: { color: colors.red, flex: 1, fontSize: 12, fontWeight: '900' },
  alertCount: { color: colors.text, backgroundColor: colors.red, borderRadius: 999, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 2, fontSize: 10, fontWeight: '900' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 4 },
  miniStat: { width: '48%', borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.glass, padding: 12, marginBottom: 10 },
  miniLabel: { color: colors.muted, fontSize: 10, textTransform: 'uppercase', fontWeight: '900', marginBottom: 5 },
  miniValue: { fontSize: 20, fontWeight: '900' },
  productTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stockBar: { height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 9, overflow: 'hidden' },
  stockFill: { height: '100%', borderRadius: 99 },
  stockMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 9 },
  strong: { color: colors.text, fontWeight: '900' },
  restockButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,75,110,0.22)', backgroundColor: 'rgba(255,75,110,0.1)' },
  restockText: { color: colors.red, fontSize: 11, fontWeight: '900' },
});
