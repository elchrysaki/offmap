import { colors } from '@offmap/design';
import { Stack } from 'expo-router/stack';

import { OffMapLogo } from '@/components/offmap-logo';

export default function SubmitStackLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.paper },
        headerLargeTitle: false,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.paper },
        headerTitle: () => <OffMapLogo compact />,
        headerTitleAlign: 'center',
        headerTransparent: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Add', headerTitle: () => <OffMapLogo compact /> }}
      />
    </Stack>
  );
}
