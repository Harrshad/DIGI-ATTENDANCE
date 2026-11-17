import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AmberButton } from '../../components/ui/AmberButton';

export default function MessageSentScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.content}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✉</Text>
          </View>

          <Text style={styles.heading}>Message Sent to Supervisor</Text>
          <Text style={styles.subheading}>Shift Under Review</Text>

          <View style={styles.card}>
            <Text style={styles.cardText}>
              Your note has been submitted to your reporting manager. Your shift status is currently set to{' '}
              <Text style={styles.boldText}>Pending Review</Text>.
            </Text>
            <Text style={styles.cardSubtext}>
              You will be notified once your manager or supervisor reviews your check-in exception.
            </Text>
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
    fontSize: 36,
    color: colors.navy[900],
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy[900],
    marginBottom: 6,
    textAlign: 'center',
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
  cardText: {
    fontSize: 15,
    color: colors.navy[900],
    lineHeight: 22,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '700',
    color: colors.amber[600],
  },
  cardSubtext: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  actionBtn: {
    marginBottom: 16,
  },
});

