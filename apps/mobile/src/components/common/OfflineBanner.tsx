import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface OfflineBannerProps {
  isOffline: boolean;
  queuedCount?: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline, queuedCount = 0 }) => {
  if (!isOffline && queuedCount === 0) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>
        {isOffline
          ? 'No internet connection. Attendance pings are queued locally.'
          : `Syncing ${queuedCount} offline record(s) with server...`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
});

