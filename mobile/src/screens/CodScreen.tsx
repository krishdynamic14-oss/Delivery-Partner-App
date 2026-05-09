import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text } from 'react-native';
import { Button, Card, Field, Header, Money, Screen } from '../components/ui';
import { colors } from '../theme';
import { useOrders } from '../state/OrdersContext';
import { submitSettlement } from '../services/api';
import { enqueueAction } from '../services/offlineQueue';
import { useAuth } from '../state/AuthContext';

export function CodScreen() {
  const { user } = useAuth();
  const { orders, codSummary } = useOrders();
  const [amount, setAmount] = useState(String(codSummary.collected));
  const codOrders = orders.filter((order) => order.paymentType === 'COD');

  async function settle() {
    const payload = { amount: Number(amount || 0), method: 'Cash' as const };
    try {
      await submitSettlement(payload, user?.token);
      Alert.alert('Settlement submitted', 'Payment log entry created.');
    } catch {
      await enqueueAction({ id: `settle-${Date.now()}`, type: 'settle', orderId: 'cod', payload, createdAt: new Date().toISOString() });
      Alert.alert('Queued offline', 'Settlement will sync when network returns.');
    }
  }

  return (
    <Screen>
      <Header title="COD Tracker" subtitle="Order-wise collection status" />
      <Card>
        <Text style={styles.label}>Collected</Text>
        <Money value={codSummary.collected} size={34} />
        <Text style={styles.meta}>Assigned ₹{codSummary.assigned.toLocaleString('en-IN')} · Remaining ₹{codSummary.remaining.toLocaleString('en-IN')}</Text>
      </Card>
      <Field value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="Settlement amount" />
      <Button label="Submit Cash Settlement" onPress={settle} />
      <FlatList
        style={{ marginTop: 14 }}
        data={codOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.order}>#{item.orderNo} · {item.customerName}</Text>
            <Text style={styles.meta}>{item.status.toUpperCase()} · ₹{item.amount.toLocaleString('en-IN')}</Text>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, marginTop: 8 },
  order: { color: colors.text, fontWeight: '800' },
});
