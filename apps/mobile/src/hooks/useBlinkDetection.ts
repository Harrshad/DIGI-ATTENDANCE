import { useState, useCallback, useRef } from 'react';

export interface BlinkDetectionState {
  blinkDetected: boolean;
  attemptCount: number;
  finalizing: boolean;
}

export function useBlinkDetection(onBlinkSuccess?: () => void) {
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const eyeClosedRef = useRef(false);

  /**
   * Process probability values from on-device ML Kit frame processor
   * Blink cycle: Eyes open (>0.75) -> Eyes close (<0.20) -> Eyes reopen (>0.75)
   */
  const processEyeProbabilities = useCallback(
    (leftEyeProb: number, rightEyeProb: number) => {
      if (blinkDetected || finalizing) return;

      const avgProb = (leftEyeProb + rightEyeProb) / 2;

      if (!eyeClosedRef.current && avgProb < 0.2) {
        eyeClosedRef.current = true;
      } else if (eyeClosedRef.current && avgProb > 0.75) {
        eyeClosedRef.current = false;
        setBlinkDetected(true);
        setFinalizing(true);
        if (onBlinkSuccess) {
          setTimeout(onBlinkSuccess, 1000);
        }
      }
    },
    [blinkDetected, finalizing, onBlinkSuccess],
  );

  const resetBlink = useCallback(() => {
    eyeClosedRef.current = false;
    setBlinkDetected(false);
    setFinalizing(false);
  }, []);

  return {
    blinkDetected,
    finalizing,
    processEyeProbabilities,
    resetBlink,
  };
}
