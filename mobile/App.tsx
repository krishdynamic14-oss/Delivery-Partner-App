import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useState } from 'react';
import { colors } from './src/theme';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { OrdersProvider } from './src/state/OrdersContext';
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

function TabNavigator() {
  const insets = useSafeAreaInsets();
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
          backgroundColor: 'rgba(14,14,22,0.92)',
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
          backgroundColor: 'rgba(14,14,22,0.92)',
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
    </OrdersProvider>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Bootstrapper />
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
