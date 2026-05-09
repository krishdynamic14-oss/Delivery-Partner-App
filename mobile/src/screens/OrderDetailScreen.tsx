import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, Header, Money, Screen } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ route, navigation }: Props) {
  const { orders } = useOrders();
  const order = orders.find((item) => item.id === route.params.orderId);

  if (!order) {
    return (
      <Screen>
        <Header title="Order not found" />
        <Button label="Back" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView>
        <Header title={`#${order.orderNo}`} subtitle={`${order.customerName} · ${order.phoneMasked}`} />
        <Card>
          <View style={styles.topRow}>
            <Badge label={order.status} tone={order.status} />
            <Money value={order.amount} />
          </View>
          <Text style={styles.product}>{order.product} × {order.quantity}</Text>
          <Text style={styles.address}>{order.address}</Text>
        </Card>
        <Card>
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>{order.paymentType}</Text>
          <Text style={styles.label}>Attempts</Text>
          <Text style={styles.value}>{order.attempts}</Text>
          {order.remarks ? <Text style={styles.remarks}>{order.remarks}</Text> : null}
        </Card>
        <View style={{ gap: 10 }}>
          <Button label="Call Customer (Masked)" tone="secondary" onPress={() => Alert.alert('Masked call', `Bonvoice call request will be sent for ${order.phoneMasked}.`)} />
          <Button label="Start Delivery Confirmation" onPress={() => navigation.navigate('Delivery', { orderId: order.id })} />
          <Button label="Report Failed / RTO" tone="danger" onPress={() => navigation.navigate('FailedDelivery', { orderId: order.id })} />
          <Button label="Back to Orders" tone="secondary" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  product: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  address: { color: colors.muted, lineHeight: 20 },
  label: { color: colors.muted, fontSize: 12, marginTop: 8, textTransform: 'uppercase', fontWeight: '800' },
  value: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  remarks: { color: colors.red, marginTop: 12 },
});
