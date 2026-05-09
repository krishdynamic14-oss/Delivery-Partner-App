import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, Field } from '../components/ui';
import { colors } from '../theme';
import { useAuth } from '../state/AuthContext';

export function LoginScreen() {
  const [phone, setPhone] = useState('9638285985');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function submit() {
    setLoading(true);
    try {
      await login(phone);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.screen}>
      <View style={styles.logo}><Text style={styles.logoText}>DB</Text></View>
      <Text style={styles.title}>Dynamic Bazar Delivery</Text>
      <Text style={styles.subtitle}>Partner MVP · Google Sheets ready</Text>
      <Field keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} placeholder="Registered mobile number" />
      <Button label="Continue" loading={loading} onPress={submit} />
      <Text style={styles.note}>Demo mode signs in as SURESHBHAI until EXPO_PUBLIC_GAS_API_URL is configured.</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg },
  logo: { width: 78, height: 78, borderRadius: 22, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  logoText: { color: colors.text, fontWeight: '900', fontSize: 26 },
  title: { color: colors.text, fontSize: 31, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: colors.muted, marginBottom: 28 },
  note: { color: colors.muted, fontSize: 12, marginTop: 18, lineHeight: 18 },
});
