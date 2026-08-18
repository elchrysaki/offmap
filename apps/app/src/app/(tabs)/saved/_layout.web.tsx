import { Stack } from 'expo-router/stack';

export default function SavedWebStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Saved opportunities — OffMap' }} />
    </Stack>
  );
}
