import { Stack } from 'expo-router';
import { colors } from '../../theme/colors';

export default function ExceptionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.navy[50] },
        animation: 'slide_from_right',
      }}
    />
  );
}

