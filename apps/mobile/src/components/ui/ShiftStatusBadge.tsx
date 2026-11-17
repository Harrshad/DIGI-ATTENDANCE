import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { MobileShiftStatus } from '@triattendance/shared';

export interface ShiftStatusBadgeProps {
  status: MobileShiftStatus;
}

export const ShiftStatusBadge: React.FC<ShiftStatusBadgeProps> = ({ status }) => {
  const isCheckedIn = status === 'Checked IN';
  const isPending = status === 'Check-in Pending';
  const isReview = status === 'Pending Review';

  return (
    <View
      style={[
        styles.badge,
        isCheckedIn && styles.badgeCheckedIn,
        isPending && styles.badgePending,
        isReview && styles.badgeReview,
      ]}
    >
      <View
        style={[
          styles.dot,
          isCheckedIn && styles.dotCheckedIn,
          isPending && styles.dotPending,
          isReview && styles.dotReview,
        ]}
      />
      <Text
        style={[
          styles.label,
          isCheckedIn && styles.labelCheckedIn,
          isPending && styles.labelPending,
          isReview && styles.labelReview,
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  badgeCheckedIn: {
    backgroundColor: '#ECFDF5',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeReview: {
    backgroundColor: '#FEF2F2',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    backgroundColor: '#64748B',
  },
  dotCheckedIn: {
    backgroundColor: '#10B981',
  },
  dotPending: {
    backgroundColor: '#F59E0B',
  },
  dotReview: {
    backgroundColor: '#EF4444',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  labelCheckedIn: {
    color: '#065F46',
  },
  labelPending: {
    color: '#B45309',
  },
  labelReview: {
    color: '#991B1B',
  },
});
