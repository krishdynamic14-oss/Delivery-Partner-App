import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Header, InfoRow, Screen } from '../components/ui';
import { SyncStatusCard } from '../components/SyncStatusCard';
import { colors } from '../theme';
import { useAuth } from '../state/AuthContext';
import { useOrders } from '../state/OrdersContext';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { pendingSync } = useOrders();

  return (
    <Screen>
      <Header title="Profile" subtitle={`${user?.role === 'admin' ? 'Admin' : 'Partner'} settings and sync status`} />
      <Card>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0] || 'D'}</Text></View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.meta}>{user?.district} · {user?.role === 'admin' ? 'Admin' : 'Delivery Partner'}</Text>
        <InfoRow icon="phone-outline" label="Mobile" value={user?.phone || '-'} />
        <InfoRow icon="cloud-sync-outline" label="Pending offline actions" value={String(pendingSync)} />
      </Card>
      <SyncStatusCard />
      <Text style={{ height: 12 }} />
      <Button label="Logout" tone="danger" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 62, height: 62, borderRadius: 20, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { color: colors.text, fontSize: 26, fontWeight: '900' },
  name: { color: colors.text, fontSize: 24, fontWeight: '900' },
  meta: { color: colors.muted, marginTop: 8, marginBottom: 12 },
});
