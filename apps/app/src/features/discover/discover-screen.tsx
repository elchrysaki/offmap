import type { OpportunityCard as OpportunityCardData } from '@offmap/contracts';
import { colors, fontFamilies, spacing } from '@offmap/design';
import { CATEGORY_CATALOG, getMainCategoryLabel } from '@offmap/taxonomy';
import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { getOpportunities } from '@/api/client';
import { ActionButton } from '@/components/action-button';
import { CollageHero } from '@/components/collage-hero';
import { FilterChip } from '@/components/filter-chip';
import { OffMapText } from '@/components/offmap-text';
import { OpportunityCard } from '@/components/opportunity-card';
import { Page } from '@/components/page';
import { StatePanel } from '@/components/state-panel';

const sorts = [
  ['recommended', 'For you'],
  ['deadline', 'Deadline'],
  ['newest', 'Newest'],
  ['verified', 'Recently checked'],
] as const;

export function DiscoverScreen({ showHero }: { showHero: boolean }) {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [mainCategory, setMainCategory] = useState<string | undefined>();
  const [availability, setAvailability] = useState<'closing-soon' | 'rolling' | undefined>();
  const [sort, setSort] = useState<(typeof sorts)[number][0]>('recommended');
  const [page, setPage] = useState(1);

  const chooseCategory = (value: string | undefined) => {
    setMainCategory(value);
    setPage(1);
  };
  const chooseAvailability = (value: 'closing-soon' | 'rolling' | undefined) => {
    setAvailability(value);
    setPage(1);
  };
  const chooseSort = (value: (typeof sorts)[number][0]) => {
    setSort(value);
    setPage(1);
  };

  const query = useQuery({
    queryKey: ['opportunities', deferredSearch, mainCategory, availability, sort, page],
    queryFn: () =>
      getOpportunities({
        query: deferredSearch || undefined,
        mainCategory,
        availability,
        sort,
        page,
        limit: 18,
      }),
  });

  const featured = useMemo(
    () => (showHero ? (query.data?.items.filter((item) => item.featured).slice(0, 3) ?? []) : []),
    [query.data?.items, showHero],
  );
  const closingSoon = useMemo(
    () =>
      showHero
        ? (query.data?.items.filter((item) => item.availability === 'closing-soon').slice(0, 3) ??
          [])
        : [],
    [query.data?.items, showHero],
  );

  return (
    <Page>
      {showHero ? <CollageHero /> : null}

      {showHero ? (
        <View style={styles.categorySection}>
          <OffMapText variant="handwritten" style={styles.kicker}>
            start somewhere interesting
          </OffMapText>
          <OffMapText accessibilityRole="header" variant="title">
            Browse by kind
          </OffMapText>
          <View style={styles.categoryRail}>
            {Object.entries(CATEGORY_CATALOG).map(([value, definition], index) => (
              <FilterChip
                key={value}
                label={`${definition.emoji} ${definition.title}`}
                selected={mainCategory === value}
                onPress={() => chooseCategory(mainCategory === value ? undefined : value)}
                count={query.data?.facets.mainCategories[value]}
              />
            ))}
          </View>
        </View>
      ) : null}

      {featured.length ? <OpportunitySection title="Featured by OffMap" items={featured} /> : null}
      {closingSoon.length ? <OpportunitySection title="Closing soon" items={closingSoon} /> : null}

      <View style={styles.discoverHeader}>
        <View style={styles.titleBlock}>
          <OffMapText variant="handwritten" style={styles.kicker}>
            {showHero ? 'the whole noticeboard ↓' : 'search less. find more.'}
          </OffMapText>
          <OffMapText accessibilityRole="header" variant="title">
            {mainCategory ? getMainCategoryLabel(mainCategory) : 'All opportunities'}
          </OffMapText>
        </View>
        <TextInput
          accessibilityLabel="Search opportunities"
          placeholder="Search title, organizer, or topic"
          placeholderTextColor={colors.mutedInk}
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setPage(1);
          }}
          returnKeyType="search"
          style={styles.search}
        />
      </View>

      <View style={styles.filterBlock}>
        {!showHero ? (
          <View style={styles.filterRail}>
            <FilterChip
              label="All categories"
              selected={!mainCategory}
              onPress={() => chooseCategory(undefined)}
            />
            {Object.entries(CATEGORY_CATALOG).map(([value, definition]) => (
              <FilterChip
                key={value}
                label={`${definition.emoji} ${definition.title}`}
                selected={mainCategory === value}
                onPress={() => chooseCategory(mainCategory === value ? undefined : value)}
                count={query.data?.facets.mainCategories[value]}
              />
            ))}
          </View>
        ) : null}
        <View style={styles.filterRail}>
          <FilterChip
            label="Closing soon"
            selected={availability === 'closing-soon'}
            onPress={() =>
              chooseAvailability(availability === 'closing-soon' ? undefined : 'closing-soon')
            }
            count={query.data?.facets.availability['closing-soon']}
          />
          <FilterChip
            label="Rolling"
            selected={availability === 'rolling'}
            onPress={() => chooseAvailability(availability === 'rolling' ? undefined : 'rolling')}
            count={query.data?.facets.availability.rolling}
          />
        </View>
        <View style={styles.filterRail}>
          {sorts.map(([value, label]) => (
            <FilterChip
              key={value}
              label={label}
              selected={sort === value}
              onPress={() => chooseSort(value)}
            />
          ))}
        </View>
      </View>

      {query.isPending ? (
        <View style={styles.loading} accessibilityLabel="Loading opportunities">
          <ActivityIndicator color={colors.ink} size="large" />
          <OffMapText>Pinning the latest opportunities to the board…</OffMapText>
        </View>
      ) : query.isError ? (
        <StatePanel
          title="The board did not load"
          message={query.error.message}
          actionLabel="Try again"
          onAction={() => void query.refetch()}
        />
      ) : query.data.items.length === 0 ? (
        <StatePanel
          title="Nothing here yet"
          message="Try a broader search or clear a filter. Missing facts are never used to pad results."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch('');
            chooseCategory(undefined);
            chooseAvailability(undefined);
          }}
        />
      ) : (
        <>
          <View style={styles.resultSummary}>
            <OffMapText variant="label">
              {query.data.pagination.totalItems} opportunities
            </OffMapText>
            {query.isFetching ? <ActivityIndicator color={colors.blue} /> : null}
          </View>
          <View style={[styles.grid, compact && styles.gridCompact]}>
            {query.data.items.map((item) => (
              <OpportunityCard key={item.id} opportunity={item} />
            ))}
          </View>
          <View style={styles.pagination}>
            <ActionButton
              label="Previous"
              tone="paper"
              disabled={page === 1}
              onPress={() => setPage((value) => Math.max(1, value - 1))}
            />
            <OffMapText variant="label">
              Page {page} of {Math.max(query.data.pagination.totalPages, 1)}
            </OffMapText>
            <ActionButton
              label="Next"
              tone="paper"
              disabled={!query.data.pagination.hasNextPage}
              onPress={() => setPage((value) => value + 1)}
            />
          </View>
        </>
      )}
    </Page>
  );
}

function OpportunitySection({ title, items }: { title: string; items: OpportunityCardData[] }) {
  return (
    <View style={styles.featureSection}>
      <OffMapText accessibilityRole="header" variant="title">
        {title}
      </OffMapText>
      <View style={styles.grid}>
        {items.map((item) => (
          <OpportunityCard key={item.id} opportunity={item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  categorySection: { marginTop: spacing.section, gap: spacing.md },
  categoryRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  kicker: { color: colors.violet },
  featureSection: { marginTop: spacing.section, gap: spacing.xl },
  discoverHeader: {
    marginTop: spacing.section,
    gap: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titleBlock: { gap: spacing.sm, flexGrow: 1, minWidth: 0 },
  search: {
    minHeight: 52,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 280,
    minWidth: 0,
    maxWidth: 520,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    color: colors.ink,
    backgroundColor: colors.paperRaised,
    fontFamily: fontFamilies.body,
    fontSize: 16,
  },
  filterBlock: { gap: spacing.md, marginVertical: spacing.xl },
  filterRail: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  loading: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  resultSummary: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    alignItems: 'stretch',
  },
  gridCompact: { gap: spacing.lg },
  pagination: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
});
