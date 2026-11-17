import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AmberButton } from '../../components/ui/AmberButton';

export default function CheckOutSuccessScreen({ route, navigation }: any) {
  const params = route?.params || {};
  const dateStr = params.date || '24 Aug 2026';
  const timeStr = params.time || '05:12 PM';
  const totalWorkStr = params.totalWork || '8h 12m';
  const locationStr = params.location || 'BLR-1, Bengaluru';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.content}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          <Text style={styles.heading}>Check Out Successful!</Text>
          <Text style={styles.subheading}>Shift Completed</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{dateStr}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Check Out Time</Text>
              <Text style={styles.value}>{timeStr}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Total Work Hours</Text>
              <Text style={[styles.value, styles.highlightVal]}>{totalWorkStr}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{locationStr}</Text>
            </View>
          </View>
        </View>

        <AmberButton
          title="Go to Home"
          onPress={() => navigation?.replace?.('(tabs)')}
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
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
    paddingTop: 40,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkIcon: {
    fontSize: 40,
    color: colors.navy[900],
    fontWeight: '800',
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy[900],
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 32,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy[900],
  },
  highlightVal: {
    color: '#065F46',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  actionBtn: {
    marginBottom: 16,
  },
});
