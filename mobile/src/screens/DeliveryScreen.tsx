import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, Field, Header, InfoRow, Money, Screen, StepPill } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { RootStackParamList } from '../types';
import { openNavigation } from '../services/maps';

type Props = NativeStackScreenProps<RootStackParamList, 'Delivery'>;

export function DeliveryScreen({ route, navigation }: Props) {
  const { orders, deliverOrder } = useOrders();
  const order = orders.find((item) => item.id === route.params.orderId);
  const [otp, setOtp] = useState('482619');
  const [photo, setPhoto] = useState<{
    uri: string;
    mimeType?: string;
    fileName?: string;
  }>();
  const [loading, setLoading] = useState(false);

  if (!order) return null;
  const currentOrder = order;

  async function pickImage() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access to capture delivery proof.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.55 }).catch(() => ImagePicker.launchImageLibraryAsync({ quality: 0.55 }));
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
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
    setLoading(true);
    try {
      const result = await deliverOrder(currentOrder.id, {
        codCollected: currentOrder.amount,
        photoUri: photo.uri,
        photoMimeType: photo.mimeType,
        photoFileName: photo.fileName,
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

  return (
    <Screen>
      <ScrollView>
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
        <Field value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder="Customer OTP" maxLength={6} />
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
  steps: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priority: { color: colors.amber, fontSize: 12, fontWeight: '900' },
  label: { color: colors.muted, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, lineHeight: 20, marginBottom: 12 },
  photo: { height: 180, borderRadius: 12, marginBottom: 12 },
});
