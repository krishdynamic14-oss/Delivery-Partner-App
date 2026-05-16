import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { Badge, Button, Card, Field, Header, Money, Screen } from '../components/ui';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useOrders } from '../state/OrdersContext';
import { fetchCodSettlementSummary, submitSettlement } from '../services/api';
import { enqueueAction } from '../services/offlineQueue';
import { useAuth } from '../state/AuthContext';
import type { CodSettlementSummary } from '../types';
import { buildUpiPaymentUrl, pickUpiId, UPI_NAME } from '../services/upi';

const todayKey = new Date().toISOString().slice(0, 10);


let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}
export function CodScreen() {
  useScreenThemeStyles();
  const { user } = useAuth();
  const { orders, codSummary } = useOrders();
  const [amount, setAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState<{
    uri: string;
    base64?: string;
    mimeType?: string;
    fileName?: string;
  }>();
  const [settlementSummary, setSettlementSummary] = useState<CodSettlementSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const codOrders = orders.filter((order) => order.paymentType === 'COD');
  const deliveredCodCount = codOrders.filter((order) => order.status === 'delivered').length;
  const pendingCodCount = codOrders.filter((order) => order.status !== 'delivered').length;
  const localCommission = codOrders
    .filter((order) => order.status === 'delivered')
    .reduce((sum, order) => sum + getCodCommission(order.amount), 0);
  const localPayable = Math.max(0, codSummary.collected - localCommission);
  const fallbackSummary = useMemo<CodSettlementSummary>(() => ({
    assignedCod: codSummary.assigned,
    cashCollected: codSummary.collected,
    upiCollected: 0,
    commissionEarned: localCommission,
    payableBeforeSettlement: localPayable,
    approvedSettled: 0,
    pendingSettlement: 0,
    cashInHand: localPayable,
    codOrderCount: codOrders.length,
    deliveredCodCount,
    pendingCodCount,
  }), [codOrders.length, codSummary.assigned, codSummary.collected, deliveredCodCount, localCommission, localPayable, pendingCodCount]);
  const summary = settlementSummary || fallbackSummary;
  const selectedUpiId = useMemo(() => pickUpiId(`${user?.phone || user?.id || 'partner'}-${todayKey}`), [user?.id, user?.phone]);

  useEffect(() => {
    let mounted = true;
    async function loadSummary() {
      setSummaryLoading(true);
      try {
        const next = await fetchCodSettlementSummary({
          partnerName: user?.name,
          partnerPhone: user?.phone,
          district: user?.district,
        }, user?.token);
        if (!mounted) return;
        setSettlementSummary(next);
        setAmount(String(next.cashInHand || ''));
      } catch {
        if (mounted) setSettlementSummary(fallbackSummary);
      } finally {
        if (mounted) setSummaryLoading(false);
      }
    }
    loadSummary();
    return () => {
      mounted = false;
    };
  }, [fallbackSummary, user?.district, user?.name, user?.phone, user?.token]);

  async function openPaymentApp() {
    const settlementAmount = Number(amount || 0);
    if (!settlementAmount || settlementAmount <= 0) {
      Alert.alert('Amount required', 'Company ko payable amount enter karo.');
      return;
    }
    if (settlementAmount > summary.cashInHand) {
      Alert.alert('Amount too high', `Pay to Company ${formatMoney(summary.cashInHand)} hai.`);
      return;
    }
    if (!selectedUpiId) {
      Alert.alert('UPI not configured', 'EXPO_PUBLIC_UPI_IDS set karo, tab UPI app open hoga.');
      return;
    }
    try {
      await openUpiPayment({
        amount: settlementAmount,
        partnerName: user?.name || 'Delivery Partner',
        upiId: selectedUpiId,
      });
    } catch {
      Alert.alert('UPI app not opened', 'Phone me UPI app/default handler check karo.');
    }
  }

  async function pickPaymentProof() {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.45,
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPaymentProof({
        uri: asset.uri,
        base64: asset.base64 || undefined,
        mimeType: asset.mimeType || 'image/jpeg',
        fileName: asset.fileName ?? `settlement-proof-${Date.now()}.jpg`,
      });
    }
  }

  async function settle() {
    const settlementAmount = Number(amount || 0);
    if (!settlementAmount || settlementAmount <= 0) {
      Alert.alert('Amount required', 'Company ko payable amount enter karo.');
      return;
    }
    if (settlementAmount > summary.cashInHand) {
      Alert.alert('Amount too high', `Pay to Company ${formatMoney(summary.cashInHand)} hai.`);
      return;
    }
    if (!paymentProof?.uri || !paymentProof.base64) {
      Alert.alert('Screenshot required', 'UPI payment complete hone ke baad payment screenshot attach karo.');
      return;
    }
    const payload = {
      amount: settlementAmount,
      method: 'UPI' as const,
      reference: paymentReference.trim(),
      photoUri: paymentProof.uri,
      photoBase64: paymentProof.base64,
      photoMimeType: paymentProof.mimeType,
      photoFileName: paymentProof.fileName,
      partnerName: user?.name,
      partnerPhone: user?.phone,
      district: user?.district,
      assignedCod: summary.assignedCod,
      collectedCod: summary.cashCollected,
      commissionEarned: summary.commissionEarned,
      payableBeforeSettlement: summary.payableBeforeSettlement,
      remainingCod: summary.cashInHand,
      cashInHand: summary.cashInHand,
      codOrderCount: summary.codOrderCount,
      deliveredCodCount: summary.deliveredCodCount,
      pendingCodCount: summary.pendingCodCount,
    };
    let settlementId = '';
    try {
      const result = await submitSettlement(payload, user?.token);
      settlementId = result.settlementId;
    } catch (err) {
      const message = String(err instanceof Error ? err.message : err);
      if (message.indexOf('Cash in Hand') !== -1 || message.indexOf('Payable to Company') !== -1 || message.indexOf('amount') !== -1) {
        Alert.alert('Request failed', message);
        return;
      }
      await enqueueAction({ id: `settle-${Date.now()}`, type: 'settle', orderId: 'cod', payload, createdAt: new Date().toISOString() }, user);
      Alert.alert('Queued offline', 'Settlement request network aate hi sync hogi.');
      return;
    }

    const next = await fetchCodSettlementSummary({
      partnerName: user?.name,
      partnerPhone: user?.phone,
      district: user?.district,
    }, user?.token);
    setSettlementSummary(next);
    setAmount(String(next.cashInHand || ''));
    setPaymentReference('');
    setPaymentProof(undefined);
    Alert.alert('Proof submitted', `Settlement ${settlementId} admin approval ke liye pending hai.`);
  }

  return (
    <Screen bottomPadding={118}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Header title="COD Tracker" subtitle="Order-wise collection status" />
        <Card>
          <Text style={styles.label}>Settlement owner</Text>
          <Text style={styles.order}>{user?.name || 'Delivery Partner'}</Text>
          <Text style={styles.meta}>{user?.district || '-'} · {user?.phone || '-'}</Text>
        </Card>
        <Card>
          <Text style={styles.label}>Pay to Company</Text>
          <Money value={summary.cashInHand} size={34} />
          <Text style={styles.meta}>Cash in hand {formatMoney(summary.cashCollected)} · Commission {formatMoney(summary.commissionEarned)}</Text>
          <Text style={styles.meta}>Before settlement {formatMoney(summary.payableBeforeSettlement)} · UPI direct {formatMoney(summary.upiCollected)}</Text>
          <Text style={styles.meta}>Pending request {formatMoney(summary.pendingSettlement)} · Approved {formatMoney(summary.approvedSettled)}</Text>
          <Text style={styles.meta}>COD orders {summary.codOrderCount} · Delivered {summary.deliveredCodCount} · Pending {summary.pendingCodCount}</Text>
          {summaryLoading ? <Text style={styles.sync}>Syncing ledger...</Text> : null}
        </Card>
        <Field value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="Payable amount" />
        <Text style={styles.upiMeta}>{selectedUpiId ? `${UPI_NAME} · ${selectedUpiId}` : 'UPI ID not configured'}</Text>
        <Button label="Open UPI App" onPress={openPaymentApp} />
        <Card>
          <Text style={styles.label}>Payment proof</Text>
          {paymentProof?.uri ? <Image source={{ uri: paymentProof.uri }} style={styles.proofImage} /> : <Text style={styles.meta}>UPI payment ke baad screenshot attach karo.</Text>}
          <Button label="Attach Screenshot" tone="secondary" onPress={pickPaymentProof} />
        </Card>
        <Field value={paymentReference} onChangeText={setPaymentReference} placeholder="UPI reference / UTR optional" autoCapitalize="characters" />
        <Button label="Submit Payment Proof" onPress={settle} />
        <Text style={styles.sectionTitle}>COD Orders</Text>
        {codOrders.map((item) => (
          <Card key={item.id}>
            <Text style={styles.order}>#{item.orderNo} · {item.customerName}</Text>
            <Text style={styles.meta}>{item.status.toUpperCase()} · ₹{item.amount.toLocaleString('en-IN')}</Text>
            <Badge label={item.status === 'delivered' ? 'collected' : 'pending cash'} tone={item.status === 'delivered' ? 'delivered' : 'pending'} />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  label: { color: colors.muted, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, marginTop: 8 },
  order: { color: colors.text, fontWeight: '800' },
  proofImage: { height: 180, borderRadius: 12, marginBottom: 12 },
  scrollContent: { paddingBottom: 148 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 10, marginTop: 16 },
  sync: { color: colors.amber, marginTop: 8, fontWeight: '800' },
  upiMeta: { color: colors.muted, fontSize: 12, marginBottom: 10, textAlign: 'center' },
});
}

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function getCodCommission(amount: number) {
  const orderAmount = Number(amount || 0);
  if (orderAmount <= 0) return 0;
  if (orderAmount <= 1199) return 150;
  if (orderAmount <= 2000) return 200;
  if (orderAmount <= 3000) return 250;
  return 300;
}

async function openUpiPayment({ amount, partnerName, upiId }: { amount: number; partnerName: string; upiId: string }) {
  const url = buildUpiPaymentUrl({
    upiId,
    payeeName: UPI_NAME,
    amount,
    note: `Dynamic Bazar COD ${partnerName}`,
  });
  await Linking.openURL(url);
}
