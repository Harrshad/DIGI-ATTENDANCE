import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AmberButton } from '../../components/ui/AmberButton';
import { MobileSecureStore } from '../../services/secure-store';

export default function ProfileScreen({ navigation }: any) {
  const employee = {
    name: 'Alex Patel',
    employeeId: '#EMP-2062',
    role: 'Frontend Engineer',
    department: 'Engineering',
    assignedSite: 'BLR-1, Bengaluru Headquarters',
    version: '1.0.2',
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await MobileSecureStore.clearTokens();
          navigation?.replace?.('(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.avatarHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AP</Text>
          </View>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.empId}>{employee.employeeId}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoVal}>{employee.department}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoVal}>{employee.role}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned Site</Text>
            <Text style={styles.infoVal}>{employee.assignedSite}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoVal}>v{employee.version}</Text>
          </View>
        </View>

        <AmberButton
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          style={styles.signOutBtn}
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
    paddingTop: 32,
  },
  avatarHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.amber[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy[900],
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy[900],
    marginBottom: 4,
  },
  empId: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy[900],
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  signOutBtn: {
    marginTop: 'auto',
    marginBottom: 24,
  },
});
