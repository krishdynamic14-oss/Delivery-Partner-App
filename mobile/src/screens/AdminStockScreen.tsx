import { Alert, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, Button, Card, Field, Screen } from '../components/ui';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useOrders } from '../state/OrdersContext';
import { useAuth } from '../state/AuthContext';
import { addStockDispatch, createStockReorderRequest, fetchDeliveryPartners, fetchStockMaster, fetchStockPhotoLogs } from '../services/api';
import type { DeliveryPartnerSummary, StockItem, StockPartnerBreakdown, StockPhotoLog } from '../types';


let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}
export function AdminStockScreen() {
  useScreenThemeStyles();
  const { user } = useAuth();
  const { loading: ordersLoading, refresh: refreshOrders } = useOrders();
  const [products, setProducts] = useState<StockItem[]>([]);
  const [partners, setPartners] = useState<DeliveryPartnerSummary[]>([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [stockProduct, setStockProduct] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [stockDistrict, setStockDistrict] = useState('');
  const [stockPartnerName, setStockPartnerName] = useState('');
  const [stockPartnerPhone, setStockPartnerPhone] = useState('');
  const [stockNotes, setStockNotes] = useState('');
  const [savingStock, setSavingStock] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockPhotoLogs, setStockPhotoLogs] = useState<StockPhotoLog[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [fresh, photos] = await Promise.all([
        fetchStockMaster(user?.token),
        fetchStockPhotoLogs({}, user?.token),
      ]);
      setProducts(fresh);
      setStockPhotoLogs(photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load Stock Master.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user?.token) return;
    fetchDeliveryPartners(user.token)
      .then(setPartners)
      .catch(() => setPartners([]));
  }, [user?.token]);

  const critical = products.filter((product) => product.status === 'critical');
  const low = products.filter((product) => product.status === 'low');
  const ok = products.filter((product) => product.status === 'ok');
  const forecast = [...critical, ...low, ...ok].slice(0, 4);
  const totalSent = products.reduce((sum, product) => sum + product.sentQty, 0);
  const totalDelivered = products.reduce((sum, product) => sum + product.deliveredQty, 0);
  const totalPending = products.reduce((sum, product) => sum + product.pendingQty, 0);
  const totalStockLeft = products.reduce((sum, product) => sum + product.remainingQty, 0);
  const districtStocks = getDistrictStocks(products);
  const refreshing = loading || ordersLoading;
  const reorderItems = [...critical, ...low];

  async function requestReorder() {
    if (!reorderItems.length) {
      Alert.alert('No low stock items', 'Inventory does not have any critical or low stock items right now.');
      return;
    }
    setReorderLoading(true);
    try {
      const result = await createStockReorderRequest({
        requestedBy: user?.name || user?.phone || 'admin',
        notes: 'Created from Inventory Forecast.',
        items: reorderItems.map((product) => ({
          product: product.product,
          sku: product.sku,
          remainingQty: product.remainingQty,
          daysLeft: product.daysLeft,
          status: product.status,
        })),
      }, user?.token);
      Alert.alert('Reorder request saved', `${result.itemCount} items saved for admin follow-up. Request ${result.requestId}.`);
    } catch (err) {
      Alert.alert('Reorder request failed', err instanceof Error ? err.message : 'Could not save reorder request.');
    } finally {
      setReorderLoading(false);
    }
  }

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
          <ActionButton icon="note-edit-outline" label="Update Stock" color={colors.orange} onPress={() => setShowUpdateForm((visible) => !visible)} />
          <ActionButton icon="cloud-sync-outline" label="Sync Sheets" color={colors.green} onPress={() => { void refreshOrders(); void refresh(); }} />
        </View>

        {showUpdateForm ? (
          <Card>
            <Text style={styles.sectionTitle}>Add Stock Dispatch</Text>
            <Text style={styles.meta}>A new sent-stock row will be saved in Stock Master.</Text>
            <Field value={stockProduct} onChangeText={setStockProduct} placeholder="Product name" />
            <Field value={stockQty} onChangeText={setStockQty} keyboardType="number-pad" placeholder="Quantity sent" />
            <Field value={stockDistrict} onChangeText={setStockDistrict} placeholder="District / location" autoCapitalize="characters" />
            <Field value={stockPartnerName} onChangeText={setStockPartnerName} placeholder="Partner name optional" />
            <Field value={stockPartnerPhone} onChangeText={setStockPartnerPhone} keyboardType="phone-pad" placeholder="Partner mobile optional" />
            {partners.length ? (
              <View style={styles.partnerChips}>
                {partners.slice(0, 8).map((partner) => (
                  <Pressable
                    key={`${partner.name}-${partner.phone || partner.numberMasked || partner.district}`}
                    onPress={() => {
                      setStockPartnerName(partner.name);
                      setStockPartnerPhone(partner.phone || '');
                      setStockDistrict(partner.district || stockDistrict);
                    }}
                    style={({ pressed }) => [styles.partnerChip, pressed && styles.pressed]}
                  >
                    <Text style={styles.partnerChipText}>{partner.name}</Text>
                    <Text style={styles.partnerChipMeta}>{partner.district || partner.numberMasked || '-'}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <Field value={stockNotes} onChangeText={setStockNotes} placeholder="Notes optional" />
            <Button label="Save Stock Dispatch" loading={savingStock} onPress={async () => {
              const quantity = Number(stockQty || 0);
              if (!stockProduct.trim()) {
                Alert.alert('Product required', 'Enter the product name.');
                return;
              }
              if (!quantity || quantity <= 0) {
                Alert.alert('Quantity required', 'Enter the quantity sent.');
                return;
              }
              if (!stockDistrict.trim() && !stockPartnerName.trim()) {
                Alert.alert('Location required', 'Select a district or delivery partner.');
                return;
              }
              setSavingStock(true);
              try {
                await addStockDispatch({
                  product: stockProduct.trim(),
                  quantity,
                  district: stockDistrict.trim(),
                  partnerName: stockPartnerName.trim(),
                  partnerPhone: stockPartnerPhone.trim(),
                  notes: stockNotes.trim(),
                }, user?.token);
                Alert.alert('Stock updated', 'Dispatch row saved in Stock Master.');
                setStockProduct('');
                setStockQty('');
                setStockNotes('');
                await refresh();
              } catch (err) {
                Alert.alert('Stock update failed', err instanceof Error ? err.message : 'Could not update stock.');
              } finally {
                setSavingStock(false);
              }
            }} />
          </Card>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <StockPhotoLogSection logs={stockPhotoLogs} />

        <Card>
          <View style={styles.forecastHeader}>
            <MaterialCommunityIcons name="chart-line" size={17} color={colors.orange} />
            <Text style={styles.sectionTitle}>Inventory Forecast</Text>
            <Text style={styles.forecastHint}>current sell rate</Text>
          </View>
          {forecast.length ? forecast.map((product) => <ForecastRow key={product.product} product={product} />) : (
            <Text style={styles.meta}>No product movement visible yet.</Text>
          )}
          <Button label="Create Reorder Request" tone="secondary" loading={reorderLoading} onPress={requestReorder} />
        </Card>

        <View style={styles.alertBanner}>
          <MaterialCommunityIcons name="alert" size={18} color={colors.red} />
          <Text style={styles.alertText}>Critical Stock Alerts</Text>
          <Text style={styles.alertCount}>{critical.length + low.length} items</Text>
        </View>

        <View style={styles.kpiGrid}>
          <MiniStat label="Total Sent" value={totalSent} color={colors.blue} />
          <MiniStat label="Delivered" value={totalDelivered} color={colors.green} />
          <MiniStat label="Pending" value={totalPending} color={colors.amber} />
          <MiniStat label="Stock Left" value={totalStockLeft} color={colors.orange} />
        </View>

        <Text style={styles.sectionTitleOutside}>District-wise Stock</Text>
        {districtStocks.length ? districtStocks.map((district) => <DistrictStockCard key={district.district} district={district} />) : (
          <Card><Text style={styles.meta}>No district stock visible yet.</Text></Card>
        )}

      </ScrollView>
    </Screen>
  );
}

function StockPhotoLogSection({ logs }: { logs: StockPhotoLog[] }) {
  const todayKey = getLocalDateKey();
  const todayCount = logs.filter((log) => log.proofDate === todayKey).length;
  const recentLogs = logs.slice(0, 8);
  return (
    <Card>
      <View style={styles.proofSectionHeader}>
        <View style={styles.proofIcon}>
          <MaterialCommunityIcons name="camera-outline" size={18} color={colors.orange} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Daily Stock Photos</Text>
          <Text style={styles.meta}>{todayCount} submitted today · latest partner uploads</Text>
        </View>
      </View>
      {recentLogs.length ? recentLogs.map((log) => <StockPhotoLogCard key={`${log.partnerPhone}-${log.proofDate}-${log.submittedAt}`} log={log} />) : (
        <View style={styles.emptyProof}>
          <MaterialCommunityIcons name="image-off-outline" size={18} color={colors.muted} />
          <Text style={styles.meta}>No stock photos submitted yet.</Text>
        </View>
      )}
    </Card>
  );
}

function StockPhotoLogCard({ log }: { log: StockPhotoLog }) {
  const submittedText = formatDateTime(log.submittedAt);
  const hasLocation = Boolean(log.latitude && log.longitude);
  return (
    <View style={styles.proofCard}>
      <View style={styles.proofCardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.proofPartner}>{log.partnerName || log.partnerPhone || 'Delivery Partner'}</Text>
          <Text style={styles.meta}>{log.district || 'No district'} · {log.proofDate} · {submittedText}</Text>
        </View>
        <Badge label={`${log.photoCount || log.photoUrls.length} photos`} tone="delivered" />
      </View>
      <View style={styles.photoButtonRow}>
        {(log.photoUrls || []).slice(0, 5).map((url, index) => (
          <Pressable
            key={`${url}-${index}`}
            onPress={() => openExternalUrl(url, 'Photo could not be opened.')}
            style={({ pressed }) => [styles.photoButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="image-outline" size={14} color={colors.orange} />
            <Text style={styles.photoButtonText}>Photo {index + 1}</Text>
          </Pressable>
        ))}
        {hasLocation ? (
          <Pressable
            onPress={() => openExternalUrl(`https://www.google.com/maps?q=${log.latitude},${log.longitude}`, 'Location could not be opened.')}
            style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="map-marker-radius-outline" size={14} color={colors.green} />
            <Text style={styles.locationButtonText}>Proof location</Text>
          </Pressable>
        ) : null}
      </View>
      {log.notes ? <Text style={styles.proofNotes}>{log.notes}</Text> : null}
    </View>
  );
}

function openExternalUrl(url: string, fallbackMessage: string) {
  if (!url) return;
  Linking.openURL(url).catch(() => Alert.alert('Could not open', fallbackMessage));
}

function formatDateTime(value?: string) {
  if (!value) return 'time not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getLocalDateKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
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

function createStyles(colors: AppColors) {
  return StyleSheet.create({
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
  proofSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  proofIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,107,0,0.13)', borderWidth: 1, borderColor: 'rgba(255,107,0,0.25)' },
  proofCard: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12, marginTop: 10 },
  proofCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  proofPartner: { color: colors.text, fontSize: 13, fontWeight: '900' },
  photoButtonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  photoButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,107,0,0.25)', backgroundColor: 'rgba(255,107,0,0.1)' },
  photoButtonText: { color: colors.orange, fontSize: 11, fontWeight: '900' },
  locationButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(0,194,126,0.25)', backgroundColor: 'rgba(0,194,126,0.1)' },
  locationButtonText: { color: colors.green, fontSize: 11, fontWeight: '900' },
  proofNotes: { color: colors.muted, fontSize: 11, marginTop: 8 },
  emptyProof: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
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
  partnerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  partnerChip: { borderWidth: 1, borderColor: 'rgba(255,179,71,0.28)', backgroundColor: 'rgba(255,179,71,0.1)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  partnerChipText: { color: colors.text, fontSize: 11, fontWeight: '900' },
  partnerChipMeta: { color: colors.muted, fontSize: 9, marginTop: 2 },
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
}
