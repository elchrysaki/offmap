import { Stack } from 'expo-router';

import { DiscoverScreen } from '@/features/discover/discover-screen';

export default function OpportunitiesRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Opportunities — OffMap' }} />
      <DiscoverScreen showHero={false} />
    </>
  );
}
