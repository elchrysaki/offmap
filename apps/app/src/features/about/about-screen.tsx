import { colors, radii, spacing } from '@offmap/design';
import { Link } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { OffMapText } from '@/components/offmap-text';
import { Page } from '@/components/page';

const principles = [
  [
    'Official sources first',
    'Material facts trace back to the organizer or official program page.',
  ],
  [
    'Humans publish',
    'Automation can organize evidence. Editors review it, and only an admin can publish.',
  ],
  [
    'Unknown stays unknown',
    'Missing deadlines, funding, eligibility, and prestige claims remain “Not confirmed.”',
  ],
  [
    'Privacy by default',
    'Browsing needs no identity. Saved items stay on this device. Optional submission email expires.',
  ],
] as const;

export function AboutScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  return (
    <Page>
      <View style={styles.hero}>
        <OffMapText variant="handwritten" style={styles.kicker}>
          built by students, for students
        </OffMapText>
        <OffMapText
          accessibilityRole="header"
          variant="display"
          style={[styles.display, compact && styles.displayCompact]}
        >
          the noticeboard we wanted.
        </OffMapText>
        <OffMapText variant="subtitle" style={styles.intro}>
          OffMap pulls worthwhile opportunities out of fragmented places and puts the evidence
          students need in one clear listing.
        </OffMapText>
      </View>
      <View style={styles.grid}>
        {principles.map(([title, body], index) => (
          <View
            key={title}
            style={[styles.card, index % 2 === 0 ? styles.blueCard : styles.orangeCard]}
          >
            <OffMapText variant="label">0{index + 1}</OffMapText>
            <OffMapText variant="title">{title}</OffMapText>
            <OffMapText>{body}</OffMapText>
          </View>
        ))}
      </View>
      <View style={styles.editorial}>
        <OffMapText accessibilityRole="header" variant="title">
          What a listing means
        </OffMapText>
        <OffMapText>
          OffMap is independent from the organizations it lists. A featured opportunity is an
          editorial selection, not sponsorship or endorsement. Dates and requirements can change, so
          the official link is always the final authority.
        </OffMapText>
        <OffMapText>
          Expired and stale listings move into a review queue instead of vanishing from editorial
          history. Submissions never publish directly.
        </OffMapText>
        <View style={styles.actions}>
          <Link href="/opportunities" asChild>
            <ActionButton label="Explore the board" tone="ink" />
          </Link>
          <Link href="/submit" asChild>
            <ActionButton label="Contribute a link" tone="lime" />
          </Link>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { maxWidth: 860, gap: spacing.lg, marginBottom: spacing.section },
  kicker: { color: colors.violet },
  display: { fontSize: 58, lineHeight: 60 },
  displayCompact: { fontSize: 42, lineHeight: 44 },
  intro: { color: colors.mutedInk },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  card: {
    flexGrow: 1,
    flexBasis: 300,
    minHeight: 230,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.large,
    backgroundColor: colors.paperRaised,
  },
  blueCard: { borderTopWidth: 12, borderTopColor: colors.blue },
  orangeCard: { borderTopWidth: 12, borderTopColor: colors.orange },
  editorial: {
    maxWidth: 760,
    marginTop: spacing.section,
    gap: spacing.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paperRaised,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
