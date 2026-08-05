import { Stack } from 'expo-router/stack';

export default function SubmitWebStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Submit an opportunity — OffMap' }} />
    </Stack>
  );
}
