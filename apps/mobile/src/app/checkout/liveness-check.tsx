/**
 * E17: Check-Out Liveness Detection
 * Same as E11 (checkin/liveness-check) but auto-advances to checkout/success.
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FaceGuideOverlay } from '../../components/camera/FaceGuideOverlay';
import { useBlinkDetection } from '../../hooks/useBlinkDetection';
import { colors } from '../../theme/colors';

export default function CheckoutLivenessScreen() {
  const { photoPath } = useLocalSearchParams<{ photoPath: string }>();
  const { hasPermission } = useCameraPermission();
  const devices = useCameraDevices();
  const frontCamera = devices.find((d) => d.position === 'front');
  const cameraRef = useRef<Camera>(null);

  const { blinkDetected, statusLabel, frameProcessor } = useBlinkDetection();

  useEffect(() => {
    if (blinkDetected) {
      const timer = setTimeout(() => {
        router.replace('/checkout/success');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [blinkDetected]);

  if (!hasPermission || !frontCamera) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.amber[500]} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={frontCamera}
        isActive
        frameProcessor={frameProcessor}
      />
      <FaceGuideOverlay highlighted={blinkDetected} />
      <SafeAreaView style={styles.topHint} edges={['top']}>
        <Text style={styles.hintText}>
          {blinkDetected ? '✅ Blink Detected!' : 'Please blink to verify liveness · Check-Out'}
        </Text>
      </SafeAreaView>
      <SafeAreaView style={styles.bottom} edges={['bottom']}>
        <View style={styles.statusChip}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy[900] },
  topHint: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', padding: 16 },
  hintText: {
    color: colors.white, fontSize: 15, fontWeight: '600', textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 24 },
  statusChip: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  statusText: { color: colors.amber[300], fontSize: 13, fontWeight: '600' },
});

