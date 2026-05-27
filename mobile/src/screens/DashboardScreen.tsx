import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Button, Card, Money, Screen } from '../components/ui';
import { SyncStatusCard } from '../components/SyncStatusCard';
import { fetchStockPhotoStatus, submitStockPhotoProof } from '../services/api';
import { captureProofImage, type ProofImage } from '../services/proofImages';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useAuth } from '../state/AuthContext';
import { useOrders } from '../state/OrdersContext';
import type { StockPhotoStatus, TabParamList } from '../types';


let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}
export function DashboardScreen() {
  useScreenThemeStyles();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { user } = useAuth();
  const { orders, loading, refresh, codSummary } = useOrders();
  const [stockPhotos, setStockPhotos] = useState<ProofImage[]>([]);
  const [stockStatus, setStockStatus] = useState<StockPhotoStatus | null>(null);
  const [stockStatusLoading, setStockStatusLoading] = useState(false);
  const [stockSubmitting, setStockSubmitting] = useState(false);
  const delivered = orders.filter((order) => order.status === 'delivered').length;
  const failed = orders.filter((order) => order.status === 'failed').length;
  const pending = orders.filter((order) => order.status === 'pending').length;
  const isPartner = user?.role !== 'admin';

  const loadStockStatus = useCallback(async () => {
    if (!isPartner) return;
    setStockStatusLoading(true);
    try {
      const status = await fetchStockPhotoStatus(user?.token);
      setStockStatus(status);
    } catch (err) {
      setStockStatus(null);
    } finally {
      setStockStatusLoading(false);
    }
  }, [isPartner, user?.token]);

  useEffect(() => {
    loadStockStatus();
  }, [loadStockStatus]);

  const refreshHome = useCallback(async () => {
    await Promise.all([refresh(), loadStockStatus()]);
  }, [loadStockStatus, refresh]);

  const addStockPhoto = useCallback(async () => {
    if (stockPhotos.length >= 5) {
      Alert.alert('Photo limit reached', 'Maximum 5 stock photos can be submitted per day.');
      return;
    }
    try {
      const proof = await captureProofImage({
        fileName: `stock-proof-${Date.now()}.jpg`,
        permissionMessage: 'Camera permission is required to capture today stock proof.',
      });
      if (proof) setStockPhotos((current) => [...current, proof].slice(0, 5));
    } catch (err) {
      Alert.alert('Stock photo not captured', err instanceof Error ? err.message : 'Please try again.');
    }
  }, [stockPhotos.length]);

  const submitStockProof = useCallback(async () => {
    if (!stockPhotos.length) {
      Alert.alert('Add stock photo', 'Capture at least one stock photo before submitting.');
      return;
    }
    setStockSubmitting(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Location permission is required with stock proof.');
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const status = await submitStockPhotoProof({
        photos: stockPhotos.map((photo) => ({
          photoBase64: photo.base64,
          photoMimeType: photo.mimeType,
          photoFileName: photo.fileName,
        })),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      }, user?.token);
      setStockStatus(status);
      setStockPhotos([]);
      Alert.alert('Stock proof submitted', `${status.photoCount} photo${status.photoCount === 1 ? '' : 's'} saved for today.`);
    } catch (err) {
      Alert.alert('Stock proof failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setStockSubmitting(false);
    }
  }, [stockPhotos, user?.token]);

  const removeStockPhoto = useCallback((uri: string) => {
    setStockPhotos((current) => current.filter((photo) => photo.uri !== uri));
  }, []);

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={loading || stockStatusLoading} onRefresh={refreshHome} tintColor={colors.orange} />}>
        <View style={styles.brandHeader}>
          <View style={styles.brandLogoWrap}>
            <Image source={require('../../assets/icon.png')} style={styles.brandLogo} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandName}>Dynamic Bazar</Text>
            <Text style={styles.brandSub}>Namaskar, {user?.name || 'Partner'} · {user?.district || 'AHMEDABAD'}</Text>
          </View>
        </View>
        <SyncStatusCard compact />
        {isPartner ? (
          <DailyStockProofCard
            photos={stockPhotos}
            status={stockStatus}
            submitting={stockSubmitting}
            onAddPhoto={addStockPhoto}
            onRemovePhoto={removeStockPhoto}
            onSubmit={submitStockProof}
          />
        ) : null}
        <LinearGradient colors={['rgba(255,107,0,0.24)', 'rgba(255,179,71,0.08)']} style={styles.hero}>
          <Text style={styles.label}>COD collected today</Text>
          <Money value={codSummary.collected} size={34} />
          <Text style={styles.meta}>Remaining ₹{codSummary.remaining.toLocaleString('en-IN')}</Text>
        </LinearGradient>
        <View style={styles.grid}>
          <Metric label="Total" value={orders.length} color={colors.blue} />
          <Metric label="Delivered" value={delivered} color={colors.green} />
          <Metric label="Pending" value={pending} color={colors.amber} />
          <Metric label="Failed" value={failed} color={colors.red} />
        </View>
        <Card>
          <Text style={styles.section}>Next priority</Text>
          <Text style={styles.order}>{orders.find((order) => order.status === 'pending')?.orderNo || 'No pending orders'}</Text>
          <Text style={styles.meta}>Pull down to refresh orders from the system.</Text>
        </Card>
        <View style={styles.actions}>
          <Button label="Start Orders" onPress={() => navigation.navigate('Orders')} />
          <Button label="COD Tracker" tone="secondary" onPress={() => navigation.navigate('COD')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.metric, { color }]}>{value}</Text>
    </Card>
  );
}

function DailyStockProofCard({
  photos,
  status,
  submitting,
  onAddPhoto,
  onRemovePhoto,
  onSubmit,
}: {
  photos: ProofImage[];
  status: StockPhotoStatus | null;
  submitting: boolean;
  onAddPhoto: () => void;
  onRemovePhoto: (uri: string) => void;
  onSubmit: () => void;
}) {
  const submitted = status?.submitted;
  return (
    <Card>
      <View style={styles.stockHeader}>
        <View>
          <Text style={styles.section}>Daily stock proof</Text>
          <Text style={styles.meta}>
            {submitted
              ? `${status?.photoCount || 0} photo${status?.photoCount === 1 ? '' : 's'} submitted today`
              : 'Capture current stock photos from camera'}
          </Text>
        </View>
        <View style={[styles.statusPill, submitted ? styles.statusPillDone : styles.statusPillPending]}>
          <MaterialCommunityIcons name={submitted ? 'check-circle' : 'clock-outline'} size={15} color={submitted ? colors.green : colors.amber} />
          <Text style={[styles.statusText, { color: submitted ? colors.green : colors.amber }]}>{submitted ? 'Done' : 'Pending'}</Text>
        </View>
      </View>
      {photos.length ? (
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={photo.uri} style={styles.photoThumbWrap}>
              <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
              <Pressable style={styles.removePhoto} onPress={() => onRemovePhoto(photo.uri)}>
                <MaterialCommunityIcons name="close" size={14} color="#fff" />
              </Pressable>
              <Text style={styles.photoIndex}>{index + 1}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.stockActions}>
        <Pressable style={styles.iconAction} onPress={onAddPhoto}>
          <MaterialCommunityIcons name="camera-plus" size={20} color={colors.orange} />
          <Text style={styles.iconActionText}>{photos.length ? 'Add photo' : submitted ? 'Retake proof' : 'Capture photo'}</Text>
          <Text style={styles.iconActionCount}>{photos.length}/5</Text>
        </Pressable>
        {photos.length ? <Button label="Submit Stock Proof" loading={submitting} onPress={onSubmit} /> : null}
      </View>
    </Card>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  hero: { borderWidth: 1, borderColor: 'rgba(255,179,71,0.22)', borderRadius: 22, padding: 18, marginBottom: 12, overflow: 'hidden' },
  brandHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  brandLogoWrap: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border },
  brandLogo: { width: 50, height: 50, resizeMode: 'contain' },
  brandName: { color: colors.text, fontSize: 20, fontWeight: '900' },
  brandSub: { color: colors.muted, fontSize: 12, marginTop: 3 },
  label: { color: colors.muted, fontSize: 12, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, marginTop: 8, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { fontSize: 28, fontWeight: '900' },
  section: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  order: { color: colors.text, fontSize: 24, fontWeight: '900' },
  actions: { gap: 10, marginBottom: 22 },
  stockHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  statusPillDone: { backgroundColor: 'rgba(0,198,122,0.1)', borderColor: 'rgba(0,198,122,0.25)' },
  statusPillPending: { backgroundColor: 'rgba(255,179,71,0.1)', borderColor: 'rgba(255,179,71,0.25)' },
  statusText: { fontSize: 12, fontWeight: '900' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  photoThumbWrap: { width: 72, height: 72, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  photoThumb: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  photoIndex: { position: 'absolute', left: 6, bottom: 5, color: '#fff', fontSize: 11, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.65)', textShadowRadius: 4 },
  stockActions: { gap: 10, marginTop: 14 },
  iconAction: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  iconActionText: { color: colors.text, fontWeight: '900', flex: 1 },
  iconActionCount: { color: colors.muted, fontWeight: '900' },
});
}
