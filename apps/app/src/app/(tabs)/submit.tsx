import { Stack } from 'expo-router';

import { SubmitScreen } from '@/features/submit/submit-screen';

export default function SubmitRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Submit an opportunity — OffMap' }} />
      <SubmitScreen />
    </>
  );
}
