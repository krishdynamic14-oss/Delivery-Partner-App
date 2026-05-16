import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Field } from '../components/ui';
import { colors as defaultColors, type AppColors } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useAuth } from '../state/AuthContext';
import { requestPasswordReset } from '../services/api';


let colors: AppColors = defaultColors;
let styles = createStyles(colors);

function useScreenThemeStyles() {
  const { theme } = useTheme();
  colors = theme.colors;
  styles = createStyles(colors);
}
export function LoginScreen() {
  useScreenThemeStyles();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();

  async function submit() {
    if (phone.replace(/\D/g, '').length !== 10) {
      Alert.alert('Mobile number required', 'Enter the registered 10-digit mobile number.');
      return;
    }
    if (password.trim().length < 4) {
      Alert.alert('Password required', 'Enter your login password.');
      return;
    }
    setLoading(true);
    try {
      await login({
        phone,
        password: password.trim(),
      });
    } catch (err) {
      Alert.alert('Login failed', err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (phone.replace(/\D/g, '').length !== 10) {
      Alert.alert('Mobile number required', 'Enter your registered 10-digit mobile number first.');
      return;
    }
    setResetLoading(true);
    try {
      const result = await requestPasswordReset(phone);
      Alert.alert('Reset requested', result.message || 'Your password reset request has been sent to admin.');
    } catch (err) {
      Alert.alert('Reset failed', err instanceof Error ? err.message : 'Could not request password reset.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.screen}>
      <View style={styles.glow} />
      <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,107,0,0.18)']} style={styles.logo}>
        <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
      </LinearGradient>
      <Text style={styles.eyebrow}>Dynamic Bazar Team App</Text>
      <Text style={styles.title}>Dynamic Bazar</Text>
      <Text style={styles.subtitle}>Secure workspace for order tracking, delivery updates, COD handover, and field operations.</Text>
      <Card>
        <Text style={styles.fieldLabel}>Registered mobile number</Text>
        <Field keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} placeholder="10-digit mobile number" />
        <Text style={styles.fieldLabel}>Password</Text>
        <View style={styles.passwordWrap}>
          <Field
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            style={styles.passwordField}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            hitSlop={12}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.eyeButton}
          >
            <MaterialCommunityIcons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.muted} />
          </Pressable>
        </View>
        <Button label="Continue" loading={loading} onPress={submit} />
        <Pressable disabled={resetLoading} onPress={resetPassword} style={styles.resetButton}>
          <Text style={styles.resetText}>{resetLoading ? 'Sending request...' : 'Forgot password?'}</Text>
        </Pressable>
      </Card>
      <Text style={styles.note}>Your role is assigned from your registered mobile number after password verification.</Text>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg, overflow: 'hidden' },
  glow: { position: 'absolute', width: 360, height: 360, borderRadius: 180, backgroundColor: 'rgba(255,107,0,0.18)', top: -120, right: -150 },
  logo: { width: 78, height: 78, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 22, shadowColor: colors.orange, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  logoImage: { width: 74, height: 74, resizeMode: 'contain' },
  eyebrow: { color: colors.amber, textTransform: 'uppercase', fontSize: 12, fontWeight: '900', marginBottom: 8 },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', marginBottom: 10, letterSpacing: 0 },
  subtitle: { color: colors.muted, marginBottom: 28, fontSize: 15, lineHeight: 22 },
  fieldLabel: { color: colors.text, fontWeight: '800', marginBottom: 10 },
  passwordWrap: { position: 'relative' },
  passwordField: { paddingRight: 52 },
  eyeButton: { position: 'absolute', right: 14, top: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  resetButton: { alignItems: 'center', paddingTop: 14, paddingBottom: 2 },
  resetText: { color: colors.amber, fontSize: 13, fontWeight: '900' },
  note: { color: colors.muted, fontSize: 12, marginTop: 18, lineHeight: 18 },
});
}
