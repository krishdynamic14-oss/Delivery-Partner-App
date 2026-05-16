import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Header, Screen } from '../components/ui';
import { useOrders } from '../state/OrdersContext';
import type { RootStackParamList } from '../types';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'FailedDelivery'>;


let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}
export function FailedDeliveryScreen({ route, navigation }: Props) {
  useScreenThemeStyles();
  const { failOrder } = useOrders();
  const [reason, setReason] = useState('Customer not available');
  const [notes, setNotes] = useState('');
  const [nextAttemptDate, setNextAttemptDate] = useState('');
  const [photo, setPhoto] = useState<{
    uri: string;
    base64?: string;
    mimeType?: string;
    fileName?: string;
  }>();
  const [loading, setLoading] = useState(false);
  const reasons = ['Customer not available', 'Phone not answered', 'Refused delivery', 'Cancelled by customer', 'Wrong address', 'Item damaged'];
  const requiresHouseProof = /refused|cancel/i.test(reason);

  async function pickImage() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access to capture house proof.');
      return;
    }
    const pickerOptions: ImagePicker.ImagePickerOptions = { quality: 0.35, base64: true };
    const result = await ImagePicker.launchCameraAsync(pickerOptions).catch(() => ImagePicker.launchImageLibraryAsync(pickerOptions));
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        base64: asset.base64 || undefined,
        mimeType: asset.mimeType || 'image/jpeg',
        fileName: asset.fileName ?? `failed-proof-${route.params.orderId}-${Date.now()}.jpg`,
      });
    }
  }

  async function submit() {
    if (!reason.trim()) {
      Alert.alert('Reason required', 'Select or enter a failed delivery reason.');
      return;
    }
    if (requiresHouseProof && !photo?.uri) {
      Alert.alert('House photo required', 'Capture the customer house proof before marking this order refused or cancelled.');
      return;
    }
    setLoading(true);
    try {
      const result = await failOrder(route.params.orderId, {
        reason: reason.trim(),
        notes: notes.trim(),
        nextAttemptDate: nextAttemptDate.trim(),
        photoUri: photo?.uri,
        photoBase64: photo?.base64,
        photoMimeType: photo?.mimeType,
        photoFileName: photo?.fileName,
        uploadProof: !!photo?.base64,
      });
      Alert.alert(result.status === 'synced' ? 'Failed delivery synced' : 'Failed delivery queued', result.message);
      navigation.navigate('Tabs', { screen: 'Orders' });
    } catch (err) {
      Alert.alert('Failed delivery not saved', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen bottomPadding={20}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
        <Card>
          <Text style={styles.label}>{requiresHouseProof ? 'House proof required' : 'House proof optional'}</Text>
          {photo?.uri ? <Image source={{ uri: photo.uri }} style={styles.photo} /> : <Text style={styles.meta}>Capture the customer house or delivery location when the customer refuses or cancels.</Text>}
          <Button label="Capture House Photo" tone="secondary" onPress={pickImage} />
        </Card>
        <Button label="Submit Failed Delivery" tone="danger" loading={loading} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  scrollContent: { paddingBottom: 20 },
  label: { color: colors.muted, textTransform: 'uppercase', fontWeight: '900', marginBottom: 12 },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reasonChip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  reasonActive: { borderColor: colors.red, backgroundColor: 'rgba(255,75,110,0.15)' },
  reasonText: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  reasonTextActive: { color: colors.text },
  meta: { color: colors.muted, lineHeight: 20, marginBottom: 12 },
  photo: { height: 180, borderRadius: 12, marginBottom: 12 },
});
}
