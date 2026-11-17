import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { AmberButton } from '../components/ui/AmberButton';
import * as Location from 'expo-location';

export default function PermissionsScreen({ navigation }: any) {
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    setLoading(true);
    try {
      // FOREGROUND ONLY: Request foreground location permission
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      const isLocOk = locStatus === 'granted';
      setLocationGranted(isLocOk);

      // Camera permission placeholder / grant
      setCameraGranted(true);

      if (isLocOk) {
        navigation?.replace?.('(tabs)');
      } else {
        Alert.alert(
          'Location Required',
          'Digital Attendance requires precise foreground location to verify your work boundary during check-in.',
        );
      }
    } catch {
      Alert.alert('Permission Error', 'Could not request system permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.heading}>Enable Permissions</Text>
        <Text style={styles.subheading}>
          To verify your attendance accurately and securely, Digital Attendance needs the following device permissions:
        </Text>

        <View style={styles.card}>
          <View style={styles.permRow}>
            <Text style={styles.icon}>📍</Text>
            <View style={styles.permText}>
              <Text style={styles.permTitle}>Foreground Location (Required)</Text>
              <Text style={styles.permDesc}>
                Used exclusively to verify site boundary upon tapping Check In or Check Out.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.permRow}>
            <Text style={styles.icon}>📷</Text>
            <View style={styles.permText}>
              <Text style={styles.permTitle}>Camera (Required)</Text>
              <Text style={styles.permDesc}>
                Used for instant on-device biometric selfie and blink liveness verification.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.promiseBox}>
          <Text style={styles.promiseIcon}>🔒</Text>
          <Text style={styles.promiseText}>
            Privacy Guarantee: Your location is never tracked between check-ins or while the app is in the background.
          </Text>
        </View>

        <AmberButton
          title="Allow Permissions"
          loading={loading}
          onPress={requestPermissions}
          style={styles.actionBtn}
        />
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
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy[900], // High contrast Navy
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: '#475569', // High contrast WCAG AA compliant slate
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  icon: {
    fontSize: 28,
    marginRight: 16,
    marginTop: 2,
  },
  permText: {
    flex: 1,
  },
  permTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy[900],
    marginBottom: 4,
  },
  permDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  promiseBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 28,
    alignItems: 'center',
  },
  promiseIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  promiseText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
    fontWeight: '500',
  },
  actionBtn: {
    marginTop: 8,
  },
});
