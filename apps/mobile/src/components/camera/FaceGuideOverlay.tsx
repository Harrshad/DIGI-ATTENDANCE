import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Ellipse, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

export interface FaceGuideOverlayProps {
  blinkDetected?: boolean;
}

export const FaceGuideOverlay: React.FC<FaceGuideOverlayProps> = ({ blinkDetected = false }) => {
  const guideColor = blinkDetected ? '#10B981' : colors.amber[500];

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg height="100%" width="100%" viewBox="0 0 300 400">
        {/* Outer face oval guide */}
        <Ellipse
          cx="150"
          cy="180"
          rx="105"
          ry="140"
          stroke={guideColor}
          strokeWidth="3.5"
          fill="none"
          strokeDasharray="6, 6"
        />

        {/* Inner pupil/nose alignment guide */}
        <Circle
          cx="150"
          cy="170"
          r="48"
          stroke="#1E293B"
          strokeWidth="2.5"
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
