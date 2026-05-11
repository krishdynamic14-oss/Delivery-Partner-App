import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, Card, Screen } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import { useAuth } from '../state/AuthContext';
import { fetchStockMaster } from '../services/api';
import type { StockItem, StockPartnerBreakdown } from '../types';

export function AdminStockScreen() {
  const { user } = useAuth();
  const { loading: ordersLoading, refresh: refreshOrders } = useOrders();
  const [products, setProducts] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fresh = await fetchStockMaster(user?.token);
      setProducts(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load Stock Master.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const critical = products.filter((product) => product.status === 'critical');
  const low = products.filter((product) => product.status === 'low');
  const ok = products.filter((product) => product.status === 'ok');
  const forecast = [...critical, ...low, ...ok].slice(0, 4);
  const totalUnits = products.reduce((sum, product) => sum + product.remainingQty, 0);
  const districtStocks = getDistrictStocks(products);
  const refreshing = loading || ordersLoading;

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.orange} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.sub}>District-wise Stock · {districtStocks.length} districts</Text>
          </View>
          <View style={styles.syncPill}><View style={styles.syncDot} /><Text style={styles.syncText}>Synced</Text></View>
        </View>

        <View style={styles.actionGrid}>
          <ActionButton icon="note-edit-outline" label="Update Stock" color={colors.orange} onPress={() => Alert.alert('Update Stock', 'Manual stock editing screen will be connected after stock sheet fields are finalized.')} />
          <ActionButton icon="cloud-sync-outline" label="Sync Sheets" color={colors.green} onPress={() => { void refreshOrders(); void refresh(); }} />
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Card>
          <View style={styles.forecastHeader}>
            <MaterialCommunityIcons name="chart-line" size={17} color={colors.orange} />
            <Text style={styles.sectionTitle}>Inventory Forecast</Text>
            <Text style={styles.forecastHint}>current sell rate</Text>
          </View>
          {forecast.length ? forecast.map((product) => <ForecastRow key={product.product} product={product} />) : (
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

        <Text style={styles.sectionTitleOutside}>District-wise Stock</Text>
        {districtStocks.length ? districtStocks.map((district) => <DistrictStockCard key={district.district} district={district} />) : (
          <Card><Text style={styles.meta}>No district stock visible yet.</Text></Card>
        )}

        <Text style={styles.sectionTitleOutside}>Product Totals</Text>
        {[...critical, ...low, ...ok].map((product) => <ProductCard key={product.product} product={product} />)}
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

function ForecastRow({ product }: { product: StockItem }) {
  const color = product.daysLeft <= 2 ? colors.red : product.daysLeft <= 5 ? colors.amber : colors.green;
  return (
    <View style={styles.forecastRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.productTitle}>{product.product}</Text>
        <Text style={styles.meta}>{product.remainingQty} remaining · {product.sellRate}/day</Text>
      </View>
      <View style={styles.daysBox}>
        <Text style={[styles.daysValue, { color }]}>~{product.daysLeft}</Text>
        <Text style={styles.daysLabel}>days left</Text>
      </View>
    </View>
  );
}

function ProductCard({ product }: { product: StockItem }) {
  const tone = product.status === 'ok' ? 'delivered' : product.status === 'low' ? 'pending' : 'failed';
  const color = product.status === 'ok' ? colors.green : product.status === 'low' ? colors.amber : colors.red;
  return (
    <Card>
      <View style={styles.productTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productTitle}>{product.product}</Text>
          <Text style={styles.meta}>SKU: {product.sku}</Text>
        </View>
        <Badge label={product.status === 'ok' ? 'OK' : product.status.toUpperCase()} tone={tone} />
      </View>
      <View style={styles.stockBar}>
        <LinearGradient colors={[color, `${color}99`]} style={[styles.stockFill, { width: `${product.stockPercent}%` }]} />
      </View>
      <View style={styles.stockMeta}>
        <Text style={styles.meta}><Text style={styles.strong}>{product.remainingQty}</Text> remaining</Text>
        <Text style={styles.meta}>{product.sentQty} sent · {product.deliveredQty} delivered</Text>
      </View>
      <Text style={styles.partnerMeta}>{product.pendingQty} pending/reserved · {product.partners.length} locations/partners</Text>
      {product.status !== 'ok' ? (
        <Pressable onPress={() => Alert.alert('Restock request sent', `${product.product} has been marked for restock.`)} style={({ pressed }) => [styles.restockButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="plus-circle-outline" size={14} color={colors.red} />
          <Text style={styles.restockText}>Restock Now</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

function DistrictStockCard({ district }: { district: DistrictStock }) {
  const tone = district.remainingQty <= 5 ? 'failed' : district.remainingQty <= 15 ? 'pending' : 'delivered';
  const color = tone === 'failed' ? colors.red : tone === 'pending' ? colors.amber : colors.green;
  const stockPercent = district.sentQty > 0 ? Math.max(0, Math.min(100, Math.round((district.remainingQty / district.sentQty) * 100))) : 0;
  return (
    <Card>
      <View style={styles.productTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.districtTitle}>{district.district}</Text>
          <Text style={styles.meta}>{district.productCount} products · {district.sentQty} sent · {district.deliveredQty} delivered</Text>
        </View>
        <Badge label={`${district.remainingQty} left`} tone={tone} />
      </View>
      <View style={styles.stockBar}>
        <LinearGradient colors={[color, `${color}99`]} style={[styles.stockFill, { width: `${stockPercent}%` }]} />
      </View>
      <View style={styles.stockMeta}>
        <Text style={styles.meta}><Text style={styles.strong}>{district.remainingQty}</Text> remaining</Text>
        <Text style={styles.meta}>{district.pendingQty} pending/reserved</Text>
      </View>
      {district.items.map((item) => <DistrictProductRow key={`${district.district}-${item.product}`} item={item} />)}
    </Card>
  );
}

function DistrictProductRow({ item }: { item: DistrictProductStock }) {
  const tone = item.remainingQty <= 5 ? colors.red : item.remainingQty <= 15 ? colors.amber : colors.green;
  return (
    <View style={styles.districtProductRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.districtProductName}>{item.product}</Text>
        <Text style={styles.meta}>{item.sentQty} sent · {item.deliveredQty} delivered · {item.pendingQty} pending</Text>
      </View>
      <Text style={[styles.districtProductQty, { color: tone }]}>{item.remainingQty}</Text>
    </View>
  );
}

type DistrictProductStock = {
  product: string;
  sentQty: number;
  deliveredQty: number;
  pendingQty: number;
  failedQty: number;
  remainingQty: number;
};

type DistrictStock = {
  district: string;
  sentQty: number;
  deliveredQty: number;
  pendingQty: number;
  failedQty: number;
  remainingQty: number;
  productCount: number;
  items: DistrictProductStock[];
};

function getDistrictStocks(products: StockItem[]) {
  const byDistrict = new Map<string, DistrictStock>();
  products.forEach((product) => {
    product.partners.forEach((line) => {
      const districtName = getDistrictName(line);
      const current = byDistrict.get(districtName) || {
        district: districtName,
        sentQty: 0,
        deliveredQty: 0,
        pendingQty: 0,
        failedQty: 0,
        remainingQty: 0,
        productCount: 0,
        items: [],
      };
      current.sentQty += line.sentQty;
      current.deliveredQty += line.deliveredQty;
      current.pendingQty += line.pendingQty;
      current.failedQty += line.failedQty;
      current.remainingQty += line.remainingQty;
      current.items.push({
        product: product.product,
        sentQty: line.sentQty,
        deliveredQty: line.deliveredQty,
        pendingQty: line.pendingQty,
        failedQty: line.failedQty,
        remainingQty: line.remainingQty,
      });
      current.productCount = new Set(current.items.map((item) => item.product)).size;
      byDistrict.set(districtName, current);
    });
  });

  return Array.from(byDistrict.values())
    .map((district) => ({
      ...district,
      items: mergeDistrictProducts(district.items).sort((a, b) => a.remainingQty - b.remainingQty || a.product.localeCompare(b.product)),
    }))
    .sort((a, b) => a.remainingQty - b.remainingQty || a.district.localeCompare(b.district));
}

function mergeDistrictProducts(items: DistrictProductStock[]) {
  const byProduct = new Map<string, DistrictProductStock>();
  items.forEach((item) => {
    const current = byProduct.get(item.product) || { product: item.product, sentQty: 0, deliveredQty: 0, pendingQty: 0, failedQty: 0, remainingQty: 0 };
    current.sentQty += item.sentQty;
    current.deliveredQty += item.deliveredQty;
    current.pendingQty += item.pendingQty;
    current.failedQty += item.failedQty;
    current.remainingQty += item.remainingQty;
    byProduct.set(item.product, current);
  });
  return Array.from(byProduct.values());
}

function getDistrictName(line: StockPartnerBreakdown) {
  return (line.district || line.name || 'Unassigned').trim().toUpperCase();
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
  districtTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  districtProductRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 10, marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  districtProductName: { color: colors.text, fontSize: 13, fontWeight: '900' },
  districtProductQty: { fontSize: 22, fontWeight: '900', minWidth: 38, textAlign: 'right' },
  meta: { color: colors.muted, fontSize: 11, marginTop: 4 },
  daysBox: { alignItems: 'flex-end', minWidth: 54 },
  daysValue: { fontSize: 20, fontWeight: '900' },
  daysLabel: { color: colors.muted, fontSize: 9 },
  reorderButton: { marginTop: 10, minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,107,0,0.25)', backgroundColor: 'rgba(255,107,0,0.12)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  reorderText: { color: colors.orange, fontSize: 12, fontWeight: '900' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,75,110,0.22)', backgroundColor: 'rgba(255,75,110,0.08)', marginBottom: 12 },
  alertText: { color: colors.red, flex: 1, fontSize: 12, fontWeight: '900' },
  alertCount: { color: colors.text, backgroundColor: colors.red, borderRadius: 999, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 2, fontSize: 10, fontWeight: '900' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,75,110,0.22)', backgroundColor: 'rgba(255,75,110,0.08)', marginBottom: 12 },
  errorText: { color: colors.red, flex: 1, fontSize: 12, fontWeight: '800' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 4 },
  miniStat: { width: '48%', borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.glass, padding: 12, marginBottom: 10 },
  miniLabel: { color: colors.muted, fontSize: 10, textTransform: 'uppercase', fontWeight: '900', marginBottom: 5 },
  miniValue: { fontSize: 20, fontWeight: '900' },
  productTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stockBar: { height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 9, overflow: 'hidden' },
  stockFill: { height: '100%', borderRadius: 99 },
  stockMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 9 },
  partnerMeta: { color: colors.muted, fontSize: 11, marginBottom: 9 },
  strong: { color: colors.text, fontWeight: '900' },
  restockButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,75,110,0.22)', backgroundColor: 'rgba(255,75,110,0.1)' },
  restockText: { color: colors.red, fontSize: 11, fontWeight: '900' },
});
