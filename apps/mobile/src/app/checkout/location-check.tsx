/**
 * E15: Check-Out Location Check
 * Mirrors E9 (checkin/location-check) but routes to checkout biometric on success.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmberButton } from '../../components/ui/AmberButton';
import { colors } from '../../theme/colors';

type LocationState = 'checking' | 'inside' | 'outside' | 'error';

export default function CheckoutLocationScreen() {
  const [state, setState] = useState<LocationState>('checking');
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    checkLocation();
  }, []);

  async function checkLocation() {
    setState('checking');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState('error');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      // For now, mock a successful location check.
      // In production the API will evaluate against the geofence.
      setDistance(240);
      setState('inside');
    } catch {
      setState('error');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verify Location</Text>
        <Text style={styles.headerSub}>Check-Out · Step 1 of 3</Text>
      </View>

      {/* Status card */}
      <View style={styles.card}>
        {state === 'checking' && (
          <>
            <ActivityIndicator color={colors.amber[500]} size="large" />
            <Text style={styles.statusText}>Acquiring GPS signal…</Text>
          </>
        )}

        {state === 'inside' && (
          <>
            <Text style={styles.icon}>📍</Text>
            <Text style={[styles.statusText, { color: colors.status.checkedIn }]}>
              You are within the work area
            </Text>
            {distance !== null && (
              <Text style={styles.distanceText}>{distance}m from site</Text>
            )}
          </>
        )}

        {(state === 'outside' || state === 'error') && (
          <>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={[styles.statusText, { color: colors.status.error }]}>
              {state === 'error'
                ? 'Could not determine location'
                : 'You are outside the work area'}
            </Text>
          </>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {state === 'inside' && (
          <AmberButton
            label="Continue to Selfie"
            onPress={() => router.push('/checkout/biometric-check')}
          />
        )}
        {(state === 'outside' || state === 'error') && (
          <>
            <AmberButton label="Retry" onPress={checkLocation} variant="outline" />
            <AmberButton
              label="Report Issue"
              onPress={() => router.push('/exceptions/outside-work-area')}
              variant="outline"
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy[50], padding: 24 },
  header: { marginBottom: 32 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.navy[900] },
  headerSub: { fontSize: 14, color: colors.navy[500], marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: { fontSize: 48 },
  statusText: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: colors.navy[800] },
  distanceText: { fontSize: 13, color: colors.navy[500] },
  actions: { marginTop: 24, gap: 12 },
});

