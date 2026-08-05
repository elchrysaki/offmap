import { colors, fontFamilies } from '@offmap/design';
import { Stack } from 'expo-router/stack';

export default function SavedStackLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.paper },
        headerLargeTitle: false,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.paper },
        headerTitle: 'OffMap',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontFamily: fontFamilies.bodyBold, fontSize: 21 },
        headerTransparent: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'OffMap' }} />
    </Stack>
  );
}
