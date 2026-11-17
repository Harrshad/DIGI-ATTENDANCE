import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AmberButton } from '../../components/ui/AmberButton';
import { MobileSecureStore } from '../../services/secure-store';
import { mobileApiFetch } from '../../services/api-client';
import { MobileAuthResponse } from '@triattendance/shared';

export default function SignInScreen({ navigation }: any) {
  const [employeeId, setEmployeeId] = useState('#EMP-2062');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!employeeId || !password) {
      Alert.alert('Validation Error', 'Please enter your Employee ID and Password.');
      return;
    }

    setLoading(true);
    try {
      const deviceId = await MobileSecureStore.getOrCreateDeviceId();
      const response = await mobileApiFetch<MobileAuthResponse>('/api/v1/auth/mobile/login', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          password,
          deviceId,
        }),
      });

      await MobileSecureStore.setTokens(response.accessToken, response.refreshToken);
      if (navigation && navigation.replace) {
        navigation.replace('(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>📐</Text>
          </View>
          <Text style={styles.title}>Digital Attendance</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <Text style={styles.label}>EMPLOYEE ID</Text>
          <TextInput
            accessibilityLabel="Employee ID"
            style={styles.input}
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="characters"
            placeholder="#EMP-2062"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            accessibilityLabel="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••••••"
            placeholderTextColor="#94A3B8"
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation?.navigate?.('forgot-password')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <AmberButton
            title="Sign In"
            loading={loading}
            onPress={handleSignIn}
            style={styles.signInBtn}
          />

          <AmberButton
            title="New User"
            variant="outline"
            onPress={() => navigation?.navigate?.('activate')}
            style={styles.newUserBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.2</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.amber[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy[900],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy[900],
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    minHeight: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.navy[900],
    marginBottom: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy[900],
  },
  signInBtn: {
    marginTop: 8,
  },
  newUserBtn: {
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
