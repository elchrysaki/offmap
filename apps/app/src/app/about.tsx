import { Stack } from 'expo-router';

import { AboutScreen } from '@/features/about/about-screen';

export default function AboutRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'About — OffMap' }} />
      <AboutScreen />
    </>
  );
}
