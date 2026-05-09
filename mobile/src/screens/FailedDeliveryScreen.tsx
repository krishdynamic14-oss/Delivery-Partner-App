import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Field, Header, Screen } from '../components/ui';
import { useOrders } from '../state/OrdersContext';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FailedDelivery'>;

export function FailedDeliveryScreen({ route, navigation }: Props) {
  const { failOrder } = useOrders();
  const [reason, setReason] = useState('Customer not available');
  const [notes, setNotes] = useState('');
  const [nextAttemptDate, setNextAttemptDate] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await failOrder(route.params.orderId, { reason, notes, nextAttemptDate });
      navigation.navigate('Tabs', { screen: 'Orders' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScrollView>
        <Header title="Failed Delivery" subtitle="Record reason for Sheet remarks and admin follow-up" />
        <Field value={reason} onChangeText={setReason} placeholder="Reason" />
        <Field value={nextAttemptDate} onChangeText={setNextAttemptDate} placeholder="Next attempt date" />
        <Field value={notes} onChangeText={setNotes} placeholder="Notes" multiline numberOfLines={4} />
        <Button label="Submit Failed Delivery" tone="danger" loading={loading} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}
