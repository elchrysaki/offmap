import { Stack } from 'expo-router/stack';

export default function DiscoverWebStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'OffMap — Student opportunities' }} />
      <Stack.Screen name="opportunities/index" options={{ title: 'Opportunities — OffMap' }} />
      <Stack.Screen name="opportunities/[slug]" options={{ title: 'Opportunity — OffMap' }} />
    </Stack>
  );
}
