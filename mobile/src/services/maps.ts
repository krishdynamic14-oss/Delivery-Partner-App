import { Alert, Linking, Platform } from 'react-native';

export async function openNavigation(address: string, district?: string) {
  const destination = [address, district].filter(Boolean).join(', ');
  if (!destination.trim()) {
    Alert.alert('Address missing', 'This order does not have an address to open in maps.');
    return;
  }

  const encoded = encodeURIComponent(destination);
  const urls = Platform.OS === 'ios'
    ? [
      `comgooglemaps://?daddr=${encoded}&directionsmode=driving`,
      `http://maps.apple.com/?daddr=${encoded}`,
      `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`,
    ]
    : [
      `google.navigation:q=${encoded}&mode=d`,
      `geo:0,0?q=${encoded}`,
      `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`,
    ];

  for (const url of urls) {
    const opened = await tryOpenUrl(url);
    if (opened) return;
  }

  Alert.alert('Map unavailable', 'Could not open maps on this device. Please install Google Maps or check browser access.');
}

async function tryOpenUrl(url: string) {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
