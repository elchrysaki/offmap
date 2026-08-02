import { colors, fontFamilies, layout, radii, spacing } from '@offmap/design';
import { getCategoryLabel } from '@offmap/taxonomy';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { getOpportunity } from '@/api/client';
import { ActionButton } from '@/components/action-button';
import { OffMapText } from '@/components/offmap-text';
import { Page } from '@/components/page';
import { StatePanel } from '@/components/state-panel';
import { useSaved } from '@/providers/saved-provider';

const confirmed = (value: string | null) => value || 'Not confirmed';

export function OpportunityScreen({ slug }: { slug?: string }) {
  const saved = useSaved();
  const query = useQuery({
    queryKey: ['opportunity', slug],
    queryFn: () => getOpportunity(slug!),
    enabled: Boolean(slug),
  });
  if (!slug)
    return (
      <Page>
        <StatePanel title="Opportunity not found" message="The link is incomplete." />
      </Page>
    );
  if (query.isPending)
    return (
      <Page>
        <StatePanel title="Opening the listing…" message="Checking the latest reviewed details." />
      </Page>
    );
  if (query.isError)
    return (
      <Page>
        <StatePanel
          title="This listing did not load"
          message={query.error.message}
          actionLabel="Try again"
          onAction={() => void query.refetch()}
        />
      </Page>
    );

  const item = query.data;
  const isSaved = saved.isSaved(item.id);
  const applyUrl = item.applicationUrl || item.officialUrl;
  const externalActionLabel = item.applicationUrl
    ? 'Open official application ↗'
    : 'Open organizer page ↗';
  return (
    <Page>
      <Link href="/opportunities" asChild>
        <Pressable
          accessibilityRole="link"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>← All opportunities</Text>
        </Pressable>
      </Link>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <View style={styles.category}>
            <OffMapText variant="label">
              {getCategoryLabel(item.mainCategory, item.category)}
            </OffMapText>
          </View>
          <OffMapText accessibilityRole="header" variant="display" style={styles.title}>
            {item.title}
          </OffMapText>
          <OffMapText variant="subtitle" style={styles.organizer}>
            {item.organizer}
            {item.edition ? ` · ${item.edition}` : ''}
          </OffMapText>
          <OffMapText variant="subtitle">{item.summary}</OffMapText>
          <View style={styles.heroActions}>
            <ActionButton
              label={externalActionLabel}
              tone="blue"
              onPress={() => void Linking.openURL(applyUrl)}
            />
            <ActionButton
              label={isSaved ? '★ Saved' : '☆ Save'}
              tone={isSaved ? 'lime' : 'paper'}
              onPress={() => saved.toggle(item.id)}
            />
            <ActionButton
              label="Share"
              tone="paper"
              onPress={() =>
                void Share.share({
                  title: item.title,
                  message: `${item.title}\n${item.officialUrl}`,
                  url: item.officialUrl,
                })
              }
            />
          </View>
          <OffMapText variant="label" style={styles.externalNote}>
            {item.applicationUrl
              ? 'The official application leaves OffMap. Check the organizer’s requirements before applying.'
              : 'No direct application link is confirmed. The organizer page leaves OffMap.'}
          </OffMapText>
        </View>
        <View style={styles.deadlineCard}>
          <OffMapText variant="handwritten" style={styles.deadlineKicker}>
            put this somewhere visible
          </OffMapText>
          <OffMapText variant="label">Application deadline</OffMapText>
          <OffMapText variant="title">{confirmed(item.applicationDeadlineDisplay)}</OffMapText>
          <View style={styles.rule} />
          <Fact label="Format" value={item.format.replace('-', ' ')} />
          <Fact label="Location" value={item.location.display} />
          <Fact
            label="Last checked"
            value={
              item.lastVerifiedAt
                ? new Date(item.lastVerifiedAt).toLocaleDateString()
                : 'Not confirmed'
            }
          />
        </View>
      </View>

      <View style={styles.columns}>
        <View style={styles.mainColumn}>
          {item.details.map((section) => (
            <Section key={section.heading} title={section.heading}>
              <OffMapText>{section.body}</OffMapText>
            </Section>
          ))}
          <Section title="Who can apply">
            <OffMapText>{confirmed(item.eligibility.summary)}</OffMapText>
            <BulletList
              values={[
                ...item.eligibility.requirements,
                ...item.eligibility.academicLevels,
                ...item.eligibility.fields,
              ]}
            />
          </Section>
          <Section title="Dates and place">
            <Fact label="Starts" value={confirmed(item.dates.startDisplay)} />
            <Fact label="Ends" value={confirmed(item.dates.endDisplay)} />
            <Fact label="Timezone" value={confirmed(item.dates.timezone)} />
            <Fact label="Location" value={item.location.display} />
          </Section>
          <Section title="Fees, funding and support">
            <Fact label="Application fee" value={confirmed(item.funding.applicationFee)} />
            <Fact label="Participation fee" value={confirmed(item.funding.participationFee)} />
            <Fact label="Scholarship" value={confirmed(item.funding.scholarship)} />
            <Fact label="Travel" value={confirmed(item.funding.travelSupport)} />
            <Fact label="Accommodation" value={confirmed(item.funding.accommodation)} />
            <Fact label="Meals" value={confirmed(item.funding.meals)} />
            <Fact label="Stipend or salary" value={confirmed(item.funding.stipendOrSalary)} />
            <Fact label="Prizes" value={confirmed(item.funding.prizes)} />
          </Section>
          {item.activities.length || item.benefits.length ? (
            <Section title="What happens there">
              <BulletList values={[...item.activities, ...item.benefits]} />
            </Section>
          ) : null}
        </View>
        <View style={styles.sideColumn}>
          <Section title="Sources and review">
            <OffMapText>{item.provenance.summary}</OffMapText>
            {item.sources.map((source) => (
              <Pressable
                key={`${source.url}-${source.checkedAt}`}
                accessibilityRole="link"
                onPress={() => void Linking.openURL(source.url)}
                style={({ pressed }) => [styles.source, pressed && styles.pressed]}
              >
                <OffMapText variant="bodyBold">{source.label} ↗</OffMapText>
                <OffMapText style={styles.sourceMeta}>
                  Checked {new Date(source.checkedAt).toLocaleDateString()}
                </OffMapText>
              </Pressable>
            ))}
          </Section>
          <View style={styles.notConfirmed}>
            <OffMapText variant="handwritten">honest gaps beat confident guesses</OffMapText>
            <OffMapText>
              “Not confirmed” means the reviewed sources did not establish that fact. Always check
              the official page.
            </OffMapText>
          </View>
        </View>
      </View>
    </Page>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <OffMapText accessibilityRole="header" variant="title">
        {title}
      </OffMapText>
      {children}
    </View>
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <OffMapText variant="label" style={styles.factLabel}>
        {label}
      </OffMapText>
      <OffMapText style={styles.factValue}>{value}</OffMapText>
    </View>
  );
}
function BulletList({ values }: { values: string[] }) {
  if (!values.length) return <OffMapText>Not confirmed</OffMapText>;
  return (
    <View style={styles.bullets}>
      {values.map((value, index) => (
        <View key={`${value}-${index}`} style={styles.bullet}>
          <Text style={styles.bulletMark}>✦</Text>
          <OffMapText style={styles.bulletText}>{value}</OffMapText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  backText: { color: colors.ink, fontFamily: fontFamilies.bodyBold, fontSize: 15 },
  hero: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxl, alignItems: 'stretch' },
  heroCopy: { flexGrow: 2, flexBasis: 520, gap: spacing.lg, paddingVertical: spacing.lg },
  category: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.lime,
    borderWidth: 2,
    borderColor: colors.ink,
    transform: [{ rotate: '-1deg' }],
  },
  title: { fontSize: 54, lineHeight: 55 },
  organizer: { color: colors.violet },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  externalNote: { color: colors.mutedInk },
  deadlineCard: {
    flexGrow: 1,
    flexBasis: 280,
    maxWidth: 390,
    gap: spacing.md,
    padding: spacing.xl,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radii.large,
    backgroundColor: colors.orange,
    transform: [{ rotate: '1deg' }],
  },
  deadlineKicker: { color: colors.ink },
  rule: { height: 2, backgroundColor: colors.ink, marginVertical: spacing.sm },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxl,
    marginTop: spacing.section,
    alignItems: 'flex-start',
  },
  mainColumn: { flexGrow: 2, flexBasis: 500, maxWidth: layout.readingMaxWidth, gap: spacing.xxl },
  sideColumn: { flexGrow: 1, flexBasis: 280, gap: spacing.xl },
  section: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
  },
  fact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17,17,17,0.2)',
  },
  factLabel: { width: 145, color: colors.mutedInk },
  factValue: { flex: 1, minWidth: 180, textTransform: 'none' },
  bullets: { gap: spacing.md },
  bullet: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  bulletMark: { color: colors.magenta, fontSize: 18, lineHeight: 24 },
  bulletText: { flex: 1 },
  source: {
    minHeight: 56,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sourceMeta: { color: colors.mutedInk, fontSize: 14 },
  notConfirmed: {
    gap: spacing.md,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.large,
    backgroundColor: colors.lime,
    transform: [{ rotate: '-1deg' }],
  },
  pressed: { opacity: 0.7 },
});
