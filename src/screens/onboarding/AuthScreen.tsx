import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { signIn, signUp, getProfile } from '../../api/auth';
import { useAppStore } from '../../store/useAppStore';
import { OnboardingStackParamList } from '../../navigation';

type Props = StackScreenProps<OnboardingStackParamList, 'Auth'>;

export function AuthScreen({ navigation, route }: Props) {
  const { role } = route.params;
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppStore();

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await signUp(email.trim(), password, role);
        if (data.user) {
          try {
            const profile = await getProfile(data.user.id);
            setUser(profile);
          } catch {
            // profile may need email confirmation; ignore
          }
        }
      } else {
        const data = await signIn(email.trim(), password);
        if (data.user) {
          const profile = await getProfile(data.user.id);
          setUser(profile);
        }
      }
      navigation.navigate('LocationPermission');
    } catch (e: any) {
      Alert.alert('Authentication failed', e?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function comingSoon() {
    Alert.alert('Coming soon', 'Social sign-in is on the way.');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{mode === 'signup' ? 'Create account' : 'Welcome back'}</Text>
          <View style={styles.toggle}>
            <TouchableOpacity onPress={() => setMode('signup')}>
              <Text style={[styles.toggleText, mode === 'signup' && styles.toggleActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
            <Text style={styles.toggleSep}>·</Text>
            <TouchableOpacity onPress={() => setMode('login')}>
              <Text style={[styles.toggleText, mode === 'login' && styles.toggleActive]}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.gray}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.gray}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading}
            activeOpacity={0.85}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.socialButton} onPress={comingSoon}>
            <Text style={styles.socialText}>Continue with Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={comingSoon}>
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By continuing you agree to WeCe's Terms of Service and Privacy Policy.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 32 },
  title: { fontFamily: Fonts.brand, fontSize: 32, color: Colors.ink },
  toggle: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  toggleText: { fontFamily: Fonts.body, fontSize: 16, color: Colors.gray },
  toggleActive: { color: Colors.tealDeep, fontFamily: Fonts.bodyBold },
  toggleSep: { marginHorizontal: 10, color: Colors.gray },
  form: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  input: {
    backgroundColor: Colors.cream2,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.ink,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  button: {
    backgroundColor: Colors.tealDeep,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: Fonts.bodyBold, fontSize: 18, color: Colors.white },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.grayLight },
  dividerText: { marginHorizontal: 12, color: Colors.gray, fontFamily: Fonts.body },
  socialButton: {
    backgroundColor: Colors.cream2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  socialText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.ink },
  terms: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
});
