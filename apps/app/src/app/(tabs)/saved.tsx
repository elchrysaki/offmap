import { Stack } from 'expo-router';

import { SavedScreen } from '@/features/saved/saved-screen';

export default function SavedRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Saved opportunities — OffMap' }} />
      <SavedScreen />
    </>
  );
}
