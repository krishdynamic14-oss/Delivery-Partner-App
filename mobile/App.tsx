import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { OrdersProvider, useOrders } from './src/state/OrdersContext';
import { ThemeProvider, useTheme } from './src/state/ThemeContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { OrderDetailScreen } from './src/screens/OrderDetailScreen';
import { DeliveryScreen } from './src/screens/DeliveryScreen';
import { FailedDeliveryScreen } from './src/screens/FailedDeliveryScreen';
import { CodScreen } from './src/screens/CodScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { AdminOrdersScreen } from './src/screens/AdminOrdersScreen';
import { AdminEarningsScreen } from './src/screens/AdminEarningsScreen';
import { AdminLiveMapScreen } from './src/screens/AdminLiveMapScreen';
import { AdminStockScreen } from './src/screens/AdminStockScreen';
import type { AdminTabParamList, RootStackParamList, TabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const AdminTabs = createBottomTabNavigator<AdminTabParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: Math.max(10, insets.bottom + 8),
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 66,
          paddingBottom: 8,
          paddingTop: 8,
          borderRadius: 22,
          shadowColor: '#000',
          shadowOpacity: 0.36,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 18,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="Home" component={DashboardScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="package-variant-closed" color={color} size={size} /> }} />
      <Tabs.Screen name="COD" component={CodScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cash-multiple" color={color} size={size} /> }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} /> }} />
    </Tabs.Navigator>
  );
}

function AdminTabNavigator() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  return (
    <AdminTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: Math.max(10, insets.bottom + 8),
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 66,
          paddingBottom: 8,
          paddingTop: 8,
          borderRadius: 22,
          shadowColor: '#000',
          shadowOpacity: 0.36,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 18,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <AdminTabs.Screen name="AdminHome" component={AdminDashboardScreen} options={{ title: 'Home', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} /> }} />
      <AdminTabs.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="clipboard-list-outline" color={color} size={size} /> }} />
      <AdminTabs.Screen name="AdminMap" component={AdminLiveMapScreen} options={{ title: 'Map', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map-marker-radius-outline" color={color} size={size} /> }} />
      <AdminTabs.Screen name="AdminEarnings" component={AdminEarningsScreen} options={{ title: 'Earnings', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-bar" color={color} size={size} /> }} />
      <AdminTabs.Screen name="AdminStock" component={AdminStockScreen} options={{ title: 'Stock', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="warehouse" color={color} size={size} /> }} />
      <AdminTabs.Screen name="AdminProfile" component={ProfileScreen} options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="shield-account-outline" color={color} size={size} /> }} />
    </AdminTabs.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.orange} />
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 22, fontWeight: '900' }}>Dynamic Bazar</Text>
        <Text style={{ color: colors.muted, marginTop: 6 }}>Preparing delivery workspace...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.surface, text: colors.text, border: colors.border },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {user.role === 'admin'
              ? <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
              : <Stack.Screen name="Tabs" component={TabNavigator} />}
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="Delivery" component={DeliveryScreen} />
            <Stack.Screen name="FailedDelivery" component={FailedDeliveryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Bootstrapper() {
  const { user } = useAuth();
  const ordersValue = useMemo(() => ({ district: user?.district || 'AHMEDABAD' }), [user?.district]);
  return (
    <OrdersProvider district={ordersValue.district}>
      <AppNavigator />
      <NotificationDeepLinkHandler />
    </OrdersProvider>
  );
}

function NotificationDeepLinkHandler() {
  const { user } = useAuth();
  const { orders, refresh } = useOrders();
  const [pendingOrderId, setPendingOrderId] = useState('');
  const handledResponseIds = useRef<Record<string, true>>({});

  useEffect(() => {
    let subscription: { remove?: () => void } | undefined;
    let mounted = true;

    async function registerListener() {
      try {
        const Notifications = await import('expo-notifications');
        const handleResponse = (response: unknown) => {
          const responseId = getNotificationResponseId(response);
          if (responseId && handledResponseIds.current[responseId]) return;
          if (responseId) handledResponseIds.current[responseId] = true;

          const orderId = getNotificationOrderId(response);
          if (orderId) setPendingOrderId(orderId);
        };

        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (mounted && lastResponse) handleResponse(lastResponse);
        if (!mounted) return;
        subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
      } catch (err) {
        console.log('Notification tap listener skipped:', err instanceof Error ? err.message : String(err || 'unknown error'));
      }
    }

    void registerListener();
    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (!pendingOrderId || !user || !navigationRef.isReady()) return;

    let cancelled = false;
    async function openOrderDetail() {
      if (!orders.some((order) => order.id === pendingOrderId)) {
        await refresh();
      }
      if (cancelled || !navigationRef.isReady()) return;
      navigationRef.navigate('OrderDetail', { orderId: pendingOrderId });
      setPendingOrderId('');
    }

    void openOrderDetail();
    return () => {
      cancelled = true;
    };
  }, [orders, pendingOrderId, refresh, user]);

  return null;
}

function getNotificationResponseId(response: unknown) {
  const value = response as { notification?: { request?: { identifier?: unknown } } };
  const identifier = value?.notification?.request?.identifier;
  return typeof identifier === 'string' ? identifier : '';
}

function getNotificationOrderId(response: unknown) {
  const value = response as { notification?: { request?: { content?: { data?: Record<string, unknown> } } } };
  const data = value?.notification?.request?.content?.data || {};
  const rawOrderId = data.orderId || data.orderNo || data.order_id;
  if (rawOrderId === undefined || rawOrderId === null) return '';
  return String(rawOrderId).replace('#', '').trim();
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Bootstrapper />
          <ThemedStatusBar />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme.statusBar} />;
}
