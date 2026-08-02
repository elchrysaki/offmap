import { Stack, useLocalSearchParams } from 'expo-router';

import { OpportunityScreen } from '@/features/opportunity/opportunity-screen';

export default function OpportunityRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return (
    <>
      <Stack.Screen options={{ title: 'Opportunity — OffMap' }} />
      <OpportunityScreen slug={slug} />
    </>
  );
}
