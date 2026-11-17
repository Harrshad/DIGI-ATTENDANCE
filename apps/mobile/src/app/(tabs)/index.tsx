import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { ShiftStatusBadge } from '../../components/ui/ShiftStatusBadge';
import { mobileApiFetch } from '../../services/api-client';
import { MobileTodayShift } from '@triattendance/shared';

export default function HomeScreen({ navigation }: any) {
  const [shift, setShift] = useState<MobileTodayShift | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShift = async () => {
    try {
      const data = await mobileApiFetch<MobileTodayShift>('/api/v1/mobile/shift/today');
      setShift(data);
    } catch {
      // Fallback state
      setShift({
        status: 'Check-in Pending',
        checkInTime: null,
        checkOutTime: null,
        totalWorkSeconds: 0,
        totalWorkFormatted: '0h 0m',
        site: {
          siteId: 'site-1',
          siteCode: 'BLR-1',
          name: 'Bengaluru Headquarters',
          city: 'Bengaluru',
          latitude: 12.9716,
          longitude: 77.5946,
          radiusMeters: 800,
          shiftStartTime: '09:00',
          lateCutoffTime: '09:30',
          timezone: 'Asia/Kolkata',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const handleAction = () => {
    if (!shift) return;

    if (shift.status === 'Check-in Pending') {
      navigation?.navigate?.('checkin/location-check');
    } else if (shift.status === 'Checked IN') {
      Alert.alert(
        'Confirm Check Out',
        `You have worked ${shift.totalWorkFormatted} today. Do you want to proceed to check-out?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Check Out', onPress: () => navigation?.navigate?.('checkout/location-check') },
        ],
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.amber[500]} />
      </SafeAreaView>
    );
  }

  const isCheckedIn = shift?.status === 'Checked IN';
  const isCheckedOut = shift?.status === 'Checked Out';
  const isPendingReview = shift?.status === 'Pending Review';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {isCheckedOut ? 'Goodbye, Alex' : 'Hello, Alex'}
            </Text>
            <Text style={styles.empId}>EMPLOYEE ID: #EMP-2062</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation?.navigate?.('profile')}
          >
            <Text style={styles.avatarText}>AP</Text>
          </TouchableOpacity>
        </View>

        {/* Shift Status Card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardHeader}>SHIFT STATUS</Text>
            {shift && <ShiftStatusBadge status={shift.status} />}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>CHECKIN TIME</Text>
              <Text style={styles.statVal}>{shift?.checkInTime || '--:--'}</Text>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>CHECKOUT TIME</Text>
              <Text style={styles.statVal}>{shift?.checkOutTime || '--:--'}</Text>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>TOTAL HOURS</Text>
              <Text style={[styles.statVal, styles.hoursVal]}>
                {shift?.totalWorkFormatted || '0h 0m'}
              </Text>
            </View>
          </View>
        </View>

        {/* Central Action Radar Area */}
        <View style={styles.centerAction}>
          {/* Radar Circles */}
          <View style={[styles.pulseRing, styles.ring3]} />
          <View style={[styles.pulseRing, styles.ring2]} />
          <View style={[styles.pulseRing, styles.ring1]} />

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isCheckedOut || isPendingReview}
            onPress={handleAction}
            style={[
              styles.actionCircle,
              isCheckedIn && styles.actionCircleCheckOut,
              (isCheckedOut || isPendingReview) && styles.actionCircleDisabled,
            ]}
          >
            <Text style={styles.actionCircleTitle}>
              {isCheckedIn ? 'CHECK OUT' : isCheckedOut ? 'LOCKED' : isPendingReview ? 'UNDER REVIEW' : 'CHECK IN'}
            </Text>
            <Text style={styles.actionCircleSub}>
              {isCheckedIn
                ? 'Tap to verify'
                : isCheckedOut
                  ? 'Check in after 9AM tomorrow'
                  : isPendingReview
                    ? 'Pending supervisor approval'
                    : 'Tap to verify'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy[900],
  },
  empId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy[900],
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
    marginBottom: 40,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy[900],
  },
  hoursVal: {
    color: colors.navy[900],
    fontWeight: '800',
  },
  centerAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 300,
    borderWidth: 1,
    borderColor: 'rgba(11, 25, 44, 0.08)',
  },
  ring1: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(11, 25, 44, 0.02)',
  },
  ring2: {
    width: 270,
    height: 270,
  },
  ring3: {
    width: 320,
    height: 320,
  },
  actionCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.navy[900],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.navy[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    padding: 16,
  },
  actionCircleCheckOut: {
    backgroundColor: '#991B1B', // Dark red for Check Out
    shadowColor: '#991B1B',
  },
  actionCircleDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionCircleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  actionCircleSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
