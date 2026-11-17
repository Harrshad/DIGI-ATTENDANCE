/**
 * E10: Check-In Biometric Capture
 * Full-screen camera view with FaceGuideOverlay. Captures selfie, then
 * navigates to liveness check (E11).
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FaceGuideOverlay } from '../../components/camera/FaceGuideOverlay';
import { colors } from '../../theme/colors';

export default function CheckinBiometricScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const devices = useCameraDevices();
  const frontCamera = devices.find((d) => d.position === 'front');
  const cameraRef = useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      // Pass photo path to liveness check screen via params
      router.push({
        pathname: '/checkin/liveness-check',
        params: { photoPath: photo.path },
      });
    } catch (err) {
      Alert.alert('Capture failed', 'Please try again.');
    } finally {
      setCapturing(false);
    }
  }, [capturing]);

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.permText}>Camera permission is required.</Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!frontCamera) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.amber[500]} />
        <Text style={styles.permText}>Loading camera…</Text>
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
        photo
      />

      {/* Face guide oval overlay */}
      <FaceGuideOverlay />

      {/* Top hint */}
      <SafeAreaView style={styles.topHint} edges={['top']}>
        <Text style={styles.hintText}>
          Position your face inside the guide and tap Capture
        </Text>
      </SafeAreaView>

      {/* Capture button */}
      <SafeAreaView style={styles.bottom} edges={['bottom']}>
        <TouchableOpacity
          style={[styles.captureBtn, capturing && styles.captureBtnDisabled]}
          onPress={handleCapture}
          disabled={capturing}
        >
          {capturing ? (
            <ActivityIndicator color={colors.navy[900]} />
          ) : (
            <Text style={styles.captureBtnText}>Capture Selfie</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy[900],
    gap: 16,
  },
  permText: { color: colors.white, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
  grantBtn: {
    backgroundColor: colors.amber[500],
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  grantText: { color: colors.navy[900], fontWeight: '700', fontSize: 15 },
  topHint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 16,
  },
  hintText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 16,
  },
  captureBtn: {
    backgroundColor: colors.amber[500],
    borderRadius: 50,
    paddingHorizontal: 40,
    paddingVertical: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  captureBtnDisabled: { opacity: 0.6 },
  captureBtnText: { color: colors.navy[900], fontWeight: '700', fontSize: 16 },
});

