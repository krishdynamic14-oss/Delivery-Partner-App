import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Field } from '../components/ui';
import { colors } from '../theme';
import { useAuth } from '../state/AuthContext';

export function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function submit() {
    if (phone.replace(/\D/g, '').length !== 10) {
      Alert.alert('Mobile number required', 'Enter the registered 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      await login(phone);
    } catch (err) {
      Alert.alert('Login failed', err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.screen}>
      <View style={styles.glow} />
      <LinearGradient colors={[colors.orange, colors.amber]} style={styles.logo}><Text style={styles.logoText}>DB</Text></LinearGradient>
      <Text style={styles.eyebrow}>Dynamic Bazar Team App</Text>
      <Text style={styles.title}>Dynamic Bazar</Text>
      <Text style={styles.subtitle}>Secure workspace for order tracking, delivery updates, COD handover, and field operations.</Text>
      <Card>
        <Text style={styles.fieldLabel}>Registered mobile number</Text>
        <Field keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} placeholder="10-digit mobile number" />
        <Button label="Continue" loading={loading} onPress={submit} />
      </Card>
      <Text style={styles.note}>Your access is assigned automatically from your registered mobile number.</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg, overflow: 'hidden' },
  glow: { position: 'absolute', width: 360, height: 360, borderRadius: 180, backgroundColor: 'rgba(255,107,0,0.18)', top: -120, right: -150 },
  logo: { width: 78, height: 78, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 22, shadowColor: colors.orange, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  logoText: { color: colors.text, fontWeight: '900', fontSize: 26 },
  eyebrow: { color: colors.amber, textTransform: 'uppercase', fontSize: 12, fontWeight: '900', marginBottom: 8 },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', marginBottom: 10, letterSpacing: 0 },
  subtitle: { color: colors.muted, marginBottom: 28, fontSize: 15, lineHeight: 22 },
  fieldLabel: { color: colors.text, fontWeight: '800', marginBottom: 10 },
  note: { color: colors.muted, fontSize: 12, marginTop: 18, lineHeight: 18 },
});
