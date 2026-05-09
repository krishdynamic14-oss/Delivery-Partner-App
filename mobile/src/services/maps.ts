import { Alert, Linking, Platform } from 'react-native';

export async function openNavigation(address: string, district?: string) {
  const destination = [address, district].filter(Boolean).join(', ');
  if (!destination.trim()) {
    Alert.alert('Address missing', 'This order does not have an address to open in maps.');
    return;
  }

  const encoded = encodeURIComponent(destination);
  const url = Platform.select({
    ios: `http://maps.apple.com/?daddr=${encoded}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`,
  });

  if (!url) return;
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert('Map unavailable', 'Could not open maps on this device.');
    return;
  }
  await Linking.openURL(url);
}
