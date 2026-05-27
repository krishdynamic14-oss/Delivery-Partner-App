import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, DeadlineBadge, Header, InfoRow, Money, Screen } from '../components/ui';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useOrders } from '../state/OrdersContext';
import { useAuth } from '../state/AuthContext';
import type { RootStackParamList } from '../types';
import { getDeadlineLabel, getDeadlineStatus } from '../services/deadlines';
import { startMaskedCall } from '../services/api';
import { useState } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;


let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}
export function OrderDetailScreen({ route, navigation }: Props) {
  useScreenThemeStyles();
  const { user } = useAuth();
  const { orders, setOrderPlannedDeliveryDate } = useOrders();
  const [calling, setCalling] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const order = orders.find((item) => item.id === route.params.orderId);

  if (!order) {
    return (
      <Screen bottomPadding={20}>
        <Header title="Order not found" />
        <Button label="Back" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const currentOrder = order;
  const proofUrl = order.photoUrl || '';
  const hasRemoteProof = proofUrl.startsWith('http');
  const isAdmin = user?.role === 'admin';
  const customerContact = order.phoneMasked || 'Number hidden';
  const needsPlannedDate = !isAdmin && order.status === 'pending' && !order.plannedDeliveryDate;

  async function callCustomer() {
    if (!user?.token) {
      Alert.alert('Login required', 'Please login again before starting a call.');
      return;
    }
    setCalling(true);
    try {
      const result = await startMaskedCall(currentOrder.id, user.token);
      Alert.alert(
        result.status === 'initiated' ? 'Call started' : 'Calling',
        result.message,
      );
    } catch (err) {
      Alert.alert('Call failed', err instanceof Error ? err.message : 'Could not start call.');
    } finally {
      setCalling(false);
    }
  }

  async function choosePlannedDate(value: string) {
    setSavingPlan(true);
    try {
      await setOrderPlannedDeliveryDate(currentOrder.id, value);
    } catch (err) {
      Alert.alert('Date not saved', err instanceof Error ? err.message : 'Could not save planned delivery date.');
    } finally {
      setSavingPlan(false);
    }
  }

  function requirePlannedDate(action: () => void) {
    if (needsPlannedDate) {
      Alert.alert('Select delivery date', 'Choose the planned delivery date before updating this order.');
      return;
    }
    action();
  }

  return (
    <Screen bottomPadding={20}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header title={`#${order.orderNo}`} subtitle={`${order.customerName} · ${customerContact}`} />
        <Card>
          <View style={styles.topRow}>
            <View style={styles.badges}>
              <Badge label={order.status} tone={order.status} />
              <Badge label={order.paymentType} tone="info" />
              {order.status === 'pending' ? <DeadlineBadge status={getDeadlineStatus(order)} label={getDeadlineLabel(order)} /> : null}
            </View>
            <Money value={order.amount} />
          </View>
          <Text style={styles.product}>{order.product} × {order.quantity}</Text>
          <InfoRow icon="account-outline" label="Customer" value={`${order.customerName} · ${customerContact}`} />
          <InfoRow icon="map-marker-outline" label="Address" value={order.address} />
          <InfoRow icon="map-outline" label="Area" value={`${order.area}, ${order.district}`} />
          <InfoRow icon="account-hard-hat-outline" label="Delivery partner" value={order.assignedTo || 'Not assigned'} />
        </Card>
        <Card>
          <InfoRow icon="credit-card-outline" label="Payment" value={order.paymentType} />
          <InfoRow icon="calendar-clock" label="Planned delivery" value={order.plannedDeliveryDate || 'Not selected'} />
          <InfoRow icon="repeat" label="Attempts" value={String(order.attempts)} />
          <InfoRow icon="clock-outline" label="Last update" value={new Date(order.updatedAt).toLocaleString()} />
          {proofUrl ? <InfoRow icon="image-check-outline" label="Proof photo" value={hasRemoteProof ? 'Uploaded to Drive' : 'Captured on this device'} /> : null}
          {order.remarks ? <Text style={styles.remarks}>{order.remarks}</Text> : null}
        </Card>
        {!isAdmin && order.status === 'pending' ? (
          <Card>
            <Text style={styles.planTitle}>{order.plannedDeliveryDate ? 'Change planned delivery date' : 'Select planned delivery date'}</Text>
            <Text style={styles.planMeta}>Choose today or within the next 3 days.</Text>
            <View style={styles.planGrid}>
              {getPlannedDeliveryOptions().map((option) => (
                <Pressable
                  key={option.value}
                  disabled={savingPlan}
                  onPress={() => { void choosePlannedDate(option.value); }}
                  style={[styles.planChip, order.plannedDeliveryDate === option.value && styles.planChipActive]}
                >
                  <Text style={[styles.planChipLabel, order.plannedDeliveryDate === option.value && styles.planChipLabelActive]}>{option.label}</Text>
                  <Text style={styles.planChipDate}>{option.display}</Text>
                </Pressable>
              ))}
            </View>
            {savingPlan ? <Text style={styles.planMeta}>Saving...</Text> : null}
          </Card>
        ) : null}
        <View style={{ gap: 10 }}>
          {!isAdmin ? <Button label="Call Customer" tone="secondary" loading={calling} onPress={callCustomer} /> : null}
          {hasRemoteProof ? <Button label="Open Proof Photo" tone="secondary" onPress={() => Linking.openURL(proofUrl)} /> : null}
          {!isAdmin ? <Button label="Start Delivery Confirmation" tone="secondary" onPress={() => requirePlannedDate(() => navigation.navigate('Delivery', { orderId: order.id }))} /> : null}
          {!isAdmin ? <Button label="Report Failed / RTO" tone="danger" onPress={() => requirePlannedDate(() => navigation.navigate('FailedDelivery', { orderId: order.id }))} /> : null}
          <Button label="Back to Orders" tone="secondary" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  scrollContent: { paddingBottom: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', flex: 1 },
  product: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  remarks: { color: colors.red, marginTop: 12 },
  planTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  planMeta: { color: colors.muted, marginTop: 7, lineHeight: 18 },
  planGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 12 },
  planChip: { width: '47%', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 11, backgroundColor: colors.glass },
  planChipActive: { borderColor: colors.orange, backgroundColor: 'rgba(255,107,0,0.14)' },
  planChipLabel: { color: colors.text, fontWeight: '900' },
  planChipLabelActive: { color: colors.orange },
  planChipDate: { color: colors.muted, marginTop: 4, fontSize: 11, fontWeight: '800' },
});
}

function getPlannedDeliveryOptions() {
  return [0, 1, 2, 3].map((offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const display = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const label = offset === 0 ? `Today · ${display}` : offset === 1 ? `Tomorrow · ${display}` : display;
    return {
      label,
      value: formatDateForApi(date),
      display,
    };
  });
}

function formatDateForApi(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}
