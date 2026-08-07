import { colors, spacing } from '@offmap/design';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, StyleSheet, useWindowDimensions, View } from 'react-native';

import { getOpportunities } from '@/api/client';
import { OffMapText } from '@/components/offmap-text';
import { OpportunityCard } from '@/components/opportunity-card';
import { Page } from '@/components/page';
import { StatePanel } from '@/components/state-panel';
import { useSaved } from '@/providers/saved-provider';

export function SavedScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const saved = useSaved();
  const query = useQuery({
    queryKey: ['opportunities', 'saved-catalog'],
    queryFn: () => getOpportunities({ limit: 50, sort: 'recommended' }),
    enabled: saved.ready && saved.ids.length > 0,
  });
  const items = query.data?.items.filter((item) => saved.ids.includes(item.id)) ?? [];

  return (
    <Page>
      <View style={styles.header}>
        <OffMapText variant="handwritten" style={styles.kicker}>
          your private shortlist
        </OffMapText>
        <OffMapText
          accessibilityRole="header"
          variant="display"
          style={[styles.title, compact && styles.titleCompact]}
        >
          saved.
        </OffMapText>
        <OffMapText variant="subtitle" style={styles.copy}>
          These stay on this device. OffMap does not need an account—or a profile of what you are
          considering.
        </OffMapText>
      </View>

      {!saved.ready || (query.isPending && saved.ids.length > 0) ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.ink} size="large" />
        </View>
      ) : saved.ids.length === 0 ? (
        <StatePanel
          title="Your shortlist is empty"
          message="Tap Save on an opportunity and it will wait here on this device."
        />
      ) : query.isError ? (
        <StatePanel
          title="Saved opportunities are offline"
          message={query.error.message}
          actionLabel="Try again"
          onAction={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <StatePanel
          title="These listings are not public now"
          message="Your saved IDs remain private and intact. They may be awaiting re-verification or have been archived."
        />
      ) : (
        <View style={[styles.grid, compact && styles.gridCompact]}>
          {items.map((item) => (
            <OpportunityCard key={item.id} opportunity={item} />
          ))}
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { maxWidth: 760, gap: spacing.md, marginBottom: spacing.xxl },
  kicker: { color: colors.magenta },
  title: { fontSize: 58, lineHeight: 60 },
  titleCompact: { fontSize: 44, lineHeight: 46 },
  copy: { color: colors.mutedInk },
  loading: { minHeight: 260, justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  gridCompact: { gap: spacing.lg },
});
