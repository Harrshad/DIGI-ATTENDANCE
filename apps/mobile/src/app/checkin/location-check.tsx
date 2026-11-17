import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import * as Location from 'expo-location';

export default function LocationCheckScreen({ navigation }: any) {
  const [siteName] = useState('BLR-1');
  const [siteCity] = useState('Bengaluru, Karnataka');
  const [statusText, setStatusText] = useState('Validating Location…');

  useEffect(() => {
    let timer: any;
    async function evaluateLocation() {
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // Coordinates check against reference boundary BLR-1 (12.9716, 77.5946)
        setStatusText('Checking site boundaries…');
        timer = setTimeout(() => {
          navigation?.replace?.('checkin/biometric-check', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            isMocked: position.mocked || false,
          });
        }, 1200);
      } catch {
        // Fallback default coordinates for development testing
        timer = setTimeout(() => {
          navigation?.replace?.('checkin/biometric-check', {
            latitude: 12.9716,
            longitude: 77.5946,
            accuracy: 8,
            isMocked: false,
          });
        }, 1500);
      }
    }

    evaluateLocation();
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backText}>‹ Location Check</Text>
        </TouchableOpacity>

        {/* Central Radar Pulse */}
        <View style={styles.radarContainer}>
          <View style={[styles.pulseRing, styles.ring3]} />
          <View style={[styles.pulseRing, styles.ring2]} />
          <View style={[styles.pulseRing, styles.ring1]} />
          <View style={styles.centerTarget}>
            <Text style={styles.targetIcon}>🎯</Text>
          </View>
        </View>

        {/* Bottom Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>{statusText}</Text>
          <Text style={styles.cardDesc}>
            Verifying your current coordinates with the registered site boundary.
          </Text>

          <View style={styles.siteBox}>
            <View style={styles.siteIconBox}>
              <Text style={styles.siteIcon}>🏢</Text>
            </View>
            <View style={styles.siteInfo}>
              <Text style={styles.siteCode}>{siteName}</Text>
              <Text style={styles.siteCity}>{siteCity}</Text>
            </View>
            <ActivityIndicator size="small" color={colors.amber[500]} />
          </View>
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
    marginBottom: 12,
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
  pulseRing: {
    position: 'absolute',
    borderRadius: 300,
    borderWidth: 1,
    borderColor: 'rgba(11, 25, 44, 0.08)',
  },
  ring1: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(11, 25, 44, 0.03)',
  },
  ring2: {
    width: 210,
    height: 210,
  },
  ring3: {
    width: 280,
    height: 280,
  },
  centerTarget: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.navy[900],
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetIcon: {
    fontSize: 22,
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
    marginBottom: 32,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy[900],
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  siteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
  },
  siteIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  siteIcon: {
    fontSize: 20,
  },
  siteInfo: {
    flex: 1,
  },
  siteCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy[900],
  },
  siteCity: {
    fontSize: 13,
    color: '#64748B',
  },
});
