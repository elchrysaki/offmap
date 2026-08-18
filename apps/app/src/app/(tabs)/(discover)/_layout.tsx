import { colors } from '@offmap/design';
import { Stack } from 'expo-router/stack';

import { OffMapLogo } from '@/components/offmap-logo';

export default function DiscoverStackLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.paper },
        headerBackButtonDisplayMode: 'minimal',
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
        options={{ title: 'Explore', headerTitle: () => <OffMapLogo compact /> }}
      />
      <Stack.Screen
        name="opportunities/index"
        options={{ title: 'Explore', headerTitle: () => <OffMapLogo compact /> }}
      />
      <Stack.Screen
        name="opportunities/[slug]"
        options={{ title: 'Opportunity', headerTitle: () => <OffMapLogo compact /> }}
      />
    </Stack>
  );
}
