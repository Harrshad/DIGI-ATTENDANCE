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

export default function ActivateScreen({ navigation }: any) {
  const [employeeId, setEmployeeId] = useState('#EMP-2062');
  const [mobileLast5, setMobileLast5] = useState('42062');
  const [voucherCode, setVoucherCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);

  const handleRequestActivation = async () => {
    if (!employeeId || mobileLast5.length !== 5) {
      Alert.alert('Validation Error', 'Please enter your Employee ID and the last 5 digits of your mobile number.');
      return;
    }

    setLoading(true);
    try {
      await mobileApiFetch('/api/v1/auth/mobile/activate', {
        method: 'POST',
        body: JSON.stringify({ employeeId, mobileLast5 }),
      });
      setStep('verify');
    } catch (err: any) {
      Alert.alert('Activation Failed', err.message || 'Unable to find matching registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyVoucher = async () => {
    if (!voucherCode || newPassword.length < 8) {
      Alert.alert('Validation Error', 'Enter the HR voucher code and choose a password with at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const deviceId = await MobileSecureStore.getOrCreateDeviceId();
      const response = await mobileApiFetch('/api/v1/auth/mobile/verify-activation', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          voucherCode,
          newPassword,
          deviceId,
        }),
      });

      await MobileSecureStore.setTokens(response.accessToken, response.refreshToken);
      Alert.alert('Account Activated', 'Your account has been successfully set up!', [
        { text: 'Continue', onPress: () => navigation?.replace?.('(tabs)') },
      ]);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid voucher code.');
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (step === 'verify' ? setStep('request') : navigation?.goBack?.())}
        >
          <Text style={styles.backText}>‹ Activate account</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Activate your account</Text>
        <Text style={styles.subheading}>
          HR has registered you. Confirm your details to set a password and start recording attendance.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>EMPLOYEE ID</Text>
          <TextInput
            style={styles.input}
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="characters"
            placeholder="#EMP-2062"
            placeholderTextColor="#94A3B8"
            editable={step === 'request'}
          />

          {step === 'request' ? (
            <>
              <Text style={styles.label}>REGISTERED MOBILE</Text>
              <TextInput
                style={styles.input}
                value={`+91 ••••• ${mobileLast5}`}
                onChangeText={(val) => setMobileLast5(val.replace(/\D/g, '').slice(-5))}
                keyboardType="numeric"
                placeholder="+91 ••••• 42062"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.footnote}>
                Last 5 digits only — confirm your HR physical activation voucher to continue.
              </Text>

              <AmberButton
                title="Send activation code"
                loading={loading}
                onPress={handleRequestActivation}
                style={styles.actionBtn}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>HR VOUCHER CODE</Text>
              <TextInput
                style={styles.input}
                value={voucherCode}
                onChangeText={setVoucherCode}
                autoCapitalize="characters"
                placeholder="HR-XXXX-XXXX"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>NEW PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Minimum 8 characters"
                placeholderTextColor="#94A3B8"
              />

              <AmberButton
                title="Verify Voucher & Set Password"
                loading={loading}
                onPress={handleVerifyVoucher}
                style={styles.actionBtn}
              />
            </>
          )}
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
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy[900],
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy[900],
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 24,
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
  footnote: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: 8,
  },
});
