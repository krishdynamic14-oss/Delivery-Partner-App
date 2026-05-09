import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, Field, Header, Money, Screen } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Delivery'>;

export function DeliveryScreen({ route, navigation }: Props) {
  const { orders, deliverOrder } = useOrders();
  const order = orders.find((item) => item.id === route.params.orderId);
  const [otp, setOtp] = useState('482619');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  if (!order) return null;
  const currentOrder = order;

  async function pickImage() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access to capture delivery proof.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function submit() {
    if (!photoUri) {
      Alert.alert('Photo required', 'Capture open-box proof before confirming delivery.');
      return;
    }
    setLoading(true);
    try {
      await deliverOrder(currentOrder.id, { codCollected: currentOrder.amount, photoUri, otp });
      navigation.navigate('Tabs', { screen: 'Orders' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScrollView>
        <Header title="Confirm Delivery" subtitle={`#${order.orderNo} · ${order.customerName}`} />
        <Card>
          <Text style={styles.label}>Collect COD</Text>
          <Money value={order.amount} size={34} />
          <Text style={styles.meta}>Call and OTP integrations are routed through GAS in production.</Text>
        </Card>
        <Field value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder="Customer OTP" maxLength={6} />
        <Card>
          <Text style={styles.label}>Open-box proof</Text>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : <Text style={styles.meta}>No photo captured yet.</Text>}
          <Button label="Capture Photo" tone="secondary" onPress={pickImage} />
        </Card>
        <Button label="Confirm Delivery" loading={loading} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, lineHeight: 20, marginBottom: 12 },
  photo: { height: 180, borderRadius: 12, marginBottom: 12 },
});
