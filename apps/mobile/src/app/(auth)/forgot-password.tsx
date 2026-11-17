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

export default function ForgotPasswordScreen({ navigation }: any) {
  const [employeeId, setEmployeeId] = useState('#EMP-2062');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!employeeId) {
      Alert.alert('Validation Error', 'Please enter your Employee ID.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Forgot Password</Text>
        <Text style={styles.subheading}>
          Enter your Employee ID. Your registered supervisor or HR admin will email you a secure reset link.
        </Text>

        <View style={styles.card}>
          {submitted ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Reset Request Submitted</Text>
              <Text style={styles.successDesc}>
                If your Employee ID matches HR records, a reset link will be dispatched to your corporate email.
              </Text>
              <AmberButton
                title="Back to Sign In"
                onPress={() => navigation?.goBack?.()}
                style={{ marginTop: 16 }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.label}>EMPLOYEE ID</Text>
              <TextInput
                style={styles.input}
                value={employeeId}
                onChangeText={setEmployeeId}
                autoCapitalize="characters"
                placeholder="#EMP-2062"
                placeholderTextColor="#94A3B8"
              />

              <AmberButton title="Submit Request" onPress={handleSubmit} style={styles.actionBtn} />
              <AmberButton
                title="Back to Sign In"
                variant="outline"
                onPress={() => navigation?.goBack?.()}
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
  actionBtn: {
    marginTop: 8,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy[900],
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
