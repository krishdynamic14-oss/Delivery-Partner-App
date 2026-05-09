import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Header, Screen } from '../components/ui';
import { useOrders } from '../state/OrdersContext';
import type { RootStackParamList } from '../types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FailedDelivery'>;

export function FailedDeliveryScreen({ route, navigation }: Props) {
  const { failOrder } = useOrders();
  const [reason, setReason] = useState('Customer not available');
  const [notes, setNotes] = useState('');
  const [nextAttemptDate, setNextAttemptDate] = useState('');
  const [loading, setLoading] = useState(false);
  const reasons = ['Customer not available', 'Phone not answered', 'Refused delivery', 'Wrong address', 'Item damaged'];

  async function submit() {
    if (!reason.trim()) {
      Alert.alert('Reason required', 'Select or enter a failed delivery reason.');
      return;
    }
    setLoading(true);
    try {
      const result = await failOrder(route.params.orderId, { reason: reason.trim(), notes: notes.trim(), nextAttemptDate: nextAttemptDate.trim() });
      Alert.alert(result.status === 'synced' ? 'Failed delivery synced' : 'Failed delivery queued', result.message);
      navigation.navigate('Tabs', { screen: 'Orders' });
    } catch (err) {
      Alert.alert('Failed delivery not saved', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScrollView>
        <Header title="Failed Delivery" subtitle="Record reason for Sheet remarks and admin follow-up" />
        <Card>
          <Text style={styles.label}>Reason</Text>
          <View style={styles.reasonGrid}>
            {reasons.map((item) => (
              <Pressable key={item} onPress={() => setReason(item)} style={[styles.reasonChip, reason === item && styles.reasonActive]}>
                <Text style={[styles.reasonText, reason === item && styles.reasonTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
        <Field value={reason} onChangeText={setReason} placeholder="Custom reason" />
        <Field value={nextAttemptDate} onChangeText={setNextAttemptDate} placeholder="Next attempt date" />
        <Field value={notes} onChangeText={setNotes} placeholder="Notes" multiline numberOfLines={4} />
        <Button label="Submit Failed Delivery" tone="danger" loading={loading} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, textTransform: 'uppercase', fontWeight: '900', marginBottom: 12 },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reasonChip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  reasonActive: { borderColor: colors.red, backgroundColor: 'rgba(255,75,110,0.15)' },
  reasonText: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  reasonTextActive: { color: colors.text },
});
