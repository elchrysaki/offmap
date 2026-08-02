import type { OpportunityCard as OpportunityCardData } from '@offmap/contracts';
import { colors, fontFamilies, radii, spacing } from '@offmap/design';
import { getCategoryLabel } from '@offmap/taxonomy';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSaved } from '@/providers/saved-provider';
import { OffMapText } from './offmap-text';

const availabilityLabels: Record<OpportunityCardData['availability'], string> = {
  upcoming: 'Upcoming',
  open: 'Open',
  'closing-soon': 'Closing soon',
  rolling: 'Rolling',
  expired: 'Expired',
  'needs-verification': 'Needs checking',
};

export function OpportunityCard({ opportunity }: { opportunity: OpportunityCardData }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(opportunity.id);
  return (
    <View style={styles.card}>
      <View style={styles.topline}>
        <View style={styles.category}>
          <Text style={styles.categoryText}>
            {getCategoryLabel(opportunity.mainCategory, opportunity.category)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            saved ? `Remove ${opportunity.title} from saved` : `Save ${opportunity.title}`
          }
          accessibilityState={{ selected: saved }}
          hitSlop={8}
          onPress={() => toggle(opportunity.id)}
          style={({ pressed }) => [
            styles.save,
            saved && styles.saveActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.saveText}>{saved ? '★ Saved' : '☆ Save'}</Text>
        </Pressable>
      </View>
      <Link href={`/opportunities/${opportunity.slug}`} asChild>
        <Pressable accessibilityRole="link" style={({ pressed }) => pressed && styles.pressed}>
          <OffMapText variant="title" style={styles.title}>
            {opportunity.title}
          </OffMapText>
          <OffMapText variant="label" style={styles.organizer}>
            {opportunity.organizer}
          </OffMapText>
          <OffMapText numberOfLines={4} style={styles.summary}>
            {opportunity.summary}
          </OffMapText>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{availabilityLabels[opportunity.availability]}</Text>
            <Text style={styles.metaText}>{opportunity.format.replace('-', ' ')}</Text>
            <Text style={styles.metaText}>{opportunity.location.display}</Text>
          </View>
          <View style={styles.deadlineRow}>
            <Text style={styles.deadlineLabel}>Deadline</Text>
            <Text style={styles.deadlineValue}>
              {opportunity.applicationDeadlineDisplay || 'Not confirmed'}
            </Text>
            <Text style={styles.arrow}>↗</Text>
          </View>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 320,
    gap: spacing.md,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.large,
    backgroundColor: colors.paperRaised,
    boxShadow: '5px 6px 0 rgba(18, 18, 18, 0.12)',
    elevation: 3,
  },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  category: {
    backgroundColor: colors.lime,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  categoryText: { color: colors.ink, fontFamily: fontFamilies.bodyBold, fontSize: 12 },
  save: {
    minHeight: 44,
    minWidth: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
  saveActive: { backgroundColor: colors.magenta },
  saveText: { color: colors.ink, fontFamily: fontFamilies.bodyBold, fontSize: 13 },
  title: { marginTop: spacing.md },
  organizer: { color: colors.violet, marginTop: spacing.sm },
  summary: { color: colors.mutedInk, marginTop: spacing.md },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  metaText: {
    color: colors.ink,
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.small,
    textTransform: 'capitalize',
  },
  deadlineRow: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deadlineLabel: {
    color: colors.mutedInk,
    fontFamily: fontFamilies.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  deadlineValue: { flex: 1, color: colors.ink, fontFamily: fontFamilies.bodyBold, fontSize: 14 },
  arrow: { color: colors.blue, fontFamily: fontFamilies.bodyBold, fontSize: 22 },
  pressed: { opacity: 0.72 },
});
