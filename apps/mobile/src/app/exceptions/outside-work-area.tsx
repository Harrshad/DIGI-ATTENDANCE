import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AmberButton } from '../../components/ui/AmberButton';
import { mobileApiFetch } from '../../services/api-client';

export default function OutsideWorkAreaScreen({ route, navigation }: any) {
  const params = route?.params || {};
  const distanceStr = params.distance || '1.4 km';
  const siteCode = params.siteCode || 'BLR-1';
  const attendanceId = params.attendanceId;

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendToSupervisor = async () => {
    if (!note.trim()) {
      Alert.alert('Message Required', 'Please enter a message explaining why you are outside the boundary.');
      return;
    }

    setLoading(true);
    try {
      await mobileApiFetch('/api/v1/mobile/exceptions/escalate', {
        method: 'POST',
        body: JSON.stringify({
          attendanceId,
          siteId: params.siteId || '00000000-0000-0000-0000-000000000000',
          note,
          latitude: params.latitude || 12.9816,
          longitude: params.longitude || 77.6046,
          measuredDistanceMeters: 1400,
        }),
      });

      navigation?.replace?.('exceptions/message-sent');
    } catch (err: any) {
      Alert.alert('Escalation Failed', err.message || 'Unable to submit note to supervisor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backText}>‹ Location Check</Text>
        </TouchableOpacity>

        {/* Warning Indicator */}
        <View style={styles.radarContainer}>
          <View style={styles.centerAlert}>
            <Text style={styles.alertIcon}>⊗</Text>
          </View>
        </View>

        {/* Bottom Action Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>You’re outside the work area</Text>
          <Text style={styles.cardDesc}>
            You are about {distanceStr} from {siteCode}. Attendance can only be recorded inside the site boundary.
          </Text>

          <View style={styles.tryThisBox}>
            <Text style={styles.tryThisHeader}>TRY THIS</Text>
            <Text style={styles.tryThisItem}>1. Turn on Location in your phone settings</Text>
            <Text style={styles.tryThisItem}>2. Step outside if you are in a basement or lift</Text>
            <Text style={styles.tryThisItem}>3. Wait a few seconds, then retry</Text>
          </View>

          <AmberButton
            title="RETRY"
            onPress={() => navigation?.goBack?.()}
            style={styles.retryBtn}
          />

          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Write a message..."
            placeholderTextColor="#94A3B8"
          />

          <TouchableOpacity
            style={styles.sendSupervisorBtn}
            onPress={handleSendToSupervisor}
            disabled={loading}
          >
            <Text style={styles.sendSupervisorText}>
              {loading ? 'Sending…' : 'Send to Supervisor'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy[900],
  },
  radarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerAlert: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.navy[900],
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  cardHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy[900],
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  tryThisBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  tryThisHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tryThisItem: {
    fontSize: 13,
    color: colors.navy[900],
    lineHeight: 20,
    fontWeight: '500',
  },
  retryBtn: {
    marginBottom: 12,
  },
  noteInput: {
    minHeight: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.navy[900],
    marginBottom: 12,
  },
  sendSupervisorBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sendSupervisorText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy[900],
  },
});
