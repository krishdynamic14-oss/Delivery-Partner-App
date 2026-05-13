import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Badge, Button, Card, Field, Header, InfoRow, Money, Screen, StepPill } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { PaymentReceivedMode, RootStackParamList } from '../types';
import { openNavigation } from '../services/maps';

type Props = NativeStackScreenProps<RootStackParamList, 'Delivery'>;
const UPI_ID = process.env.EXPO_PUBLIC_UPI_ID || '';
const UPI_NAME = process.env.EXPO_PUBLIC_UPI_NAME || 'Dynamic Bazar';

export function DeliveryScreen({ route, navigation }: Props) {
  const { orders, deliverOrder, sendOrderOtp } = useOrders();
  const order = orders.find((item) => item.id === route.params.orderId);
  const [otp, setOtp] = useState('');
  const [photo, setPhoto] = useState<{
    uri: string;
    base64?: string;
    mimeType?: string;
    fileName?: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentReceivedMode>(order?.paymentType === 'Prepaid' ? 'Prepaid' : 'Cash');
  const [paymentReference, setPaymentReference] = useState('');

  if (!order) return null;
  const currentOrder = order;

  async function pickImage() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access to capture delivery proof.');
      return;
    }
    const pickerOptions: ImagePicker.ImagePickerOptions = { quality: 0.35, base64: true };
    const result = await ImagePicker.launchCameraAsync(pickerOptions).catch(() => ImagePicker.launchImageLibraryAsync(pickerOptions));
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        base64: asset.base64 || undefined,
        mimeType: asset.mimeType || 'image/jpeg',
        fileName: asset.fileName ?? `delivery-proof-${currentOrder.id}-${Date.now()}.jpg`,
      });
    }
  }

  async function submit() {
    if (otp.length !== 6) {
      Alert.alert('OTP required', 'Enter the 6-digit customer OTP before confirming delivery.');
      return;
    }
    if (!photo?.uri) {
      Alert.alert('Photo required', 'Capture open-box proof before confirming delivery.');
      return;
    }
    if (paymentMode === 'UPI QR' && !paymentReference.trim()) {
      Alert.alert('UPI reference required', 'Enter UPI reference or UTR after customer payment.');
      return;
    }
    setLoading(true);
    try {
      const receivedAmount = paymentMode === 'Prepaid' ? 0 : currentOrder.amount;
      const result = await deliverOrder(currentOrder.id, {
        codCollected: receivedAmount,
        paymentReceivedMode: paymentMode,
        paymentReference: paymentReference.trim(),
        paymentReceivedAmount: receivedAmount,
        photoUri: photo.uri,
        photoBase64: photo.base64,
        photoMimeType: photo.mimeType,
        photoFileName: photo.fileName,
        uploadProof: true,
        otp,
        notes: 'Proof photo captured locally.',
      });
      Alert.alert(result.status === 'synced' ? 'Delivery synced' : 'Delivery queued', result.message);
      navigation.navigate('Tabs', { screen: 'Orders' });
    } catch (err) {
      Alert.alert('Delivery not saved', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const upiQrValue = buildUpiPaymentUrl({
    upiId: UPI_ID,
    payeeName: UPI_NAME,
    amount: currentOrder.amount,
    orderNo: currentOrder.orderNo,
  });
  const paymentOptions: PaymentReceivedMode[] = currentOrder.paymentType === 'Prepaid' ? ['Prepaid'] : ['Cash', 'UPI QR'];

  async function sendOtp() {
    setOtpLoading(true);
    try {
      const result = await sendOrderOtp(currentOrder.id);
      Alert.alert('OTP sent', result.message);
    } catch (err) {
      Alert.alert('OTP not sent', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <Screen bottomPadding={20}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header title="Confirm Delivery" subtitle={`#${order.orderNo} · ${order.customerName}`} />
        <View style={styles.steps}>
          <StepPill index={1} label="Call" done />
          <StepPill index={2} label="OTP" active={!photo?.uri} />
          <StepPill index={3} label="Photo" active={!!photo?.uri} />
          <StepPill index={4} label="COD" />
        </View>
        <Card>
          <View style={styles.topRow}>
            <Badge label={order.paymentType} tone="info" />
            <Text style={styles.priority}>Priority route</Text>
          </View>
          <Text style={styles.label}>Collect COD</Text>
          <Money value={order.amount} size={34} />
          <InfoRow icon="account-outline" label="Customer" value={`${order.customerName} · ${order.phoneMasked}`} />
          <InfoRow icon="map-marker-outline" label="Address" value={order.address} />
          <Button label="Open Route in Maps" tone="secondary" onPress={() => openNavigation(order.address, order.district)} />
        </Card>
        <Button
          label={order.deliveryOtpSentStatus === 'SENT' ? 'Resend OTP to Customer' : 'Send OTP to Customer'}
          tone="secondary"
          loading={otpLoading}
          onPress={sendOtp}
        />
        <Field value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder="Customer OTP" maxLength={6} />
        <Card>
          <Text style={styles.label}>Payment received</Text>
          <View style={styles.paymentOptions}>
            {paymentOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setPaymentMode(option)}
                style={({ pressed }) => [styles.paymentOption, paymentMode === option && styles.paymentOptionActive, pressed && styles.pressed]}
              >
                <Text style={[styles.paymentOptionText, paymentMode === option && styles.paymentOptionTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>
          {paymentMode === 'UPI QR' ? (
            <View style={styles.qrBlock}>
              {UPI_ID ? (
                <View style={styles.qrBox}>
                  <QRCode value={upiQrValue} size={190} backgroundColor="#ffffff" color="#111111" />
                </View>
              ) : (
                <Text style={styles.meta}>UPI ID is not configured. Add EXPO_PUBLIC_UPI_ID before using QR payment.</Text>
              )}
              <Text style={styles.qrMeta}>{UPI_NAME}{UPI_ID ? ` · ${UPI_ID}` : ''}</Text>
              <Money value={currentOrder.amount} size={24} />
              <Field
                value={paymentReference}
                onChangeText={setPaymentReference}
                placeholder="UPI reference / UTR"
                autoCapitalize="characters"
              />
            </View>
          ) : null}
        </Card>
        <Card>
          <Text style={styles.label}>Open-box proof</Text>
          {photo?.uri ? <Image source={{ uri: photo.uri }} style={styles.photo} /> : <Text style={styles.meta}>No photo captured yet.</Text>}
          <Button label="Capture Photo" tone="secondary" onPress={pickImage} />
        </Card>
        <Button label="Confirm Delivery" loading={loading} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 20 },
  steps: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priority: { color: colors.amber, fontSize: 12, fontWeight: '900' },
  label: { color: colors.muted, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, lineHeight: 20, marginBottom: 12 },
  photo: { height: 180, borderRadius: 12, marginBottom: 12 },
  paymentOptions: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  paymentOption: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glassStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  paymentOptionActive: { borderColor: colors.amber, backgroundColor: 'rgba(255,179,71,0.14)' },
  paymentOptionText: { color: colors.muted, fontSize: 13, fontWeight: '900' },
  paymentOptionTextActive: { color: colors.text },
  pressed: { opacity: 0.82 },
  qrBlock: { alignItems: 'center', gap: 10 },
  qrBox: { padding: 14, borderRadius: 12, backgroundColor: '#ffffff', marginTop: 2 },
  qrMeta: { color: colors.text, fontSize: 13, fontWeight: '800', textAlign: 'center' },
});

function buildUpiPaymentUrl({ upiId, payeeName, amount, orderNo }: { upiId: string; payeeName: string; amount: number; orderNo: string }) {
  const params = [
    ['pa', upiId],
    ['pn', payeeName],
    ['am', amount.toFixed(2)],
    ['cu', 'INR'],
    ['tn', `Dynamic Bazar Order ${orderNo}`],
  ];
  return `upi://pay?${params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`;
}
