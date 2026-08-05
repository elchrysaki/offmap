import { useLocalSearchParams } from 'expo-router';

import { OpportunityScreen } from '@/features/opportunity/opportunity-screen';

export default function OpportunityRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <OpportunityScreen slug={slug} />;
}
