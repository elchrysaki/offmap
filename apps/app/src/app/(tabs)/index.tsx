import { Stack } from 'expo-router';

import { DiscoverScreen } from '@/features/discover/discover-screen';

export default function DiscoverRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'OffMap — Student opportunities' }} />
      <DiscoverScreen showHero />
    </>
  );
}
