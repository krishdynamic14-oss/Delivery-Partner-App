import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, Header, InfoRow, Money, Screen } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import type { RootStackParamList } from '../types';
import { openNavigation } from '../services/maps';

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
            <View style={styles.badges}>
              <Badge label={order.status} tone={order.status} />
              <Badge label={order.paymentType} tone="info" />
            </View>
            <Money value={order.amount} />
          </View>
          <Text style={styles.product}>{order.product} × {order.quantity}</Text>
          <InfoRow icon="account-outline" label="Customer" value={`${order.customerName} · ${order.phoneMasked}`} />
          <InfoRow icon="map-marker-outline" label="Address" value={order.address} />
          <InfoRow icon="map-outline" label="Area" value={`${order.area}, ${order.district}`} />
          <InfoRow icon="account-hard-hat-outline" label="Delivery partner" value={order.assignedTo || 'Not assigned'} />
        </Card>
        <Card>
          <InfoRow icon="credit-card-outline" label="Payment" value={order.paymentType} />
          <InfoRow icon="repeat" label="Attempts" value={String(order.attempts)} />
          <InfoRow icon="clock-outline" label="Last update" value={new Date(order.updatedAt).toLocaleString()} />
          {order.remarks ? <Text style={styles.remarks}>{order.remarks}</Text> : null}
        </Card>
        <View style={{ gap: 10 }}>
          <Button label="Open Route in Maps" onPress={() => openNavigation(order.address, order.district)} />
          <Button label="Call Customer (Masked)" tone="secondary" onPress={() => Alert.alert('Masked call', `Bonvoice call request will be sent for ${order.phoneMasked}.`)} />
          <Button label="Start Delivery Confirmation" tone="secondary" onPress={() => navigation.navigate('Delivery', { orderId: order.id })} />
          <Button label="Report Failed / RTO" tone="danger" onPress={() => navigation.navigate('FailedDelivery', { orderId: order.id })} />
          <Button label="Back to Orders" tone="secondary" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', flex: 1 },
  product: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  remarks: { color: colors.red, marginTop: 12 },
});
