import { StyleSheet, Text } from 'react-native';
import { Button, Card, Header, Screen } from '../components/ui';
import { colors } from '../theme';
import { useAuth } from '../state/AuthContext';
import { useOrders } from '../state/OrdersContext';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { pendingSync, syncOfflineQueue } = useOrders();

  return (
    <Screen>
      <Header title="Profile" subtitle="Partner settings and sync status" />
      <Card>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.meta}>{user?.district} · {user?.phone}</Text>
        <Text style={styles.meta}>Pending offline actions: {pendingSync}</Text>
      </Card>
      <Button label="Sync Offline Queue" tone="secondary" onPress={syncOfflineQueue} />
      <Text style={{ height: 12 }} />
      <Button label="Logout" tone="danger" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontSize: 24, fontWeight: '900' },
  meta: { color: colors.muted, marginTop: 8 },
});
