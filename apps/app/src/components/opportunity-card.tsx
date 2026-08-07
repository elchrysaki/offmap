import type { OpportunityCard as OpportunityCardData } from '@offmap/contracts';
import { colors, fontFamilies, radii, spacing } from '@offmap/design';
import { getCategoryLabel } from '@offmap/taxonomy';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useSaved } from '@/providers/saved-provider';
import { ActionButton } from './action-button';
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
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const [cardHovered, setCardHovered] = useState(false);
  const [cardFocused, setCardFocused] = useState(false);
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(opportunity.id);
  return (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        cardHovered && styles.cardHovered,
        cardFocused && styles.cardFocused,
      ]}
    >
      <View accessibilityElementsHidden style={styles.paintCorner} />
      <View style={styles.topline}>
        <View style={styles.category}>
          <Text style={styles.categoryText}>
            {getCategoryLabel(opportunity.mainCategory, opportunity.category)}
          </Text>
        </View>
        <ActionButton
          label={saved ? '★ Saved' : '☆ Save'}
          accessibilityLabel={
            saved ? `Remove ${opportunity.title} from saved` : `Save ${opportunity.title}`
          }
          accessibilityState={{ selected: saved }}
          tone={saved ? 'magenta' : 'paper'}
          onPress={() => toggle(opportunity.id)}
          style={styles.save}
        />
      </View>
      <Link href={`/opportunities/${opportunity.slug}`} asChild>
        <Pressable
          accessibilityRole="link"
          onBlur={() => setCardFocused(false)}
          onFocus={() => setCardFocused(true)}
          onHoverIn={() => setCardHovered(true)}
          onHoverOut={() => setCardHovered(false)}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <OffMapText variant="title" style={[styles.title, compact && styles.titleCompact]}>
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
    flexShrink: 1,
    flexBasis: 320,
    minWidth: 0,
    maxWidth: '100%',
    position: 'relative',
    overflow: 'hidden',
    gap: spacing.md,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.large,
    backgroundColor: colors.paperRaised,
    boxShadow: '5px 6px 0 rgba(18, 18, 18, 0.12)',
    elevation: 3,
  },
  cardCompact: {
    width: '100%',
    flexBasis: '100%',
    padding: spacing.lg,
    borderRadius: radii.medium,
  },
  paintCorner: {
    position: 'absolute',
    width: 120,
    height: 28,
    right: -28,
    top: 12,
    backgroundColor: 'rgba(255,90,36,0.28)',
    transform: [{ rotate: '9deg' }],
  },
  cardHovered: { transform: [{ translateY: -2 }], boxShadow: '7px 8px 0 rgba(18,18,18,0.2)' },
  cardFocused: { borderColor: colors.focus, borderWidth: 3 },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  category: {
    backgroundColor: colors.lime,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.ink,
    flexShrink: 1,
  },
  categoryText: {
    color: colors.ink,
    fontFamily: fontFamilies.bodyBold,
    fontSize: 12,
    flexShrink: 1,
  },
  save: {
    minHeight: 44,
    minWidth: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: { marginTop: spacing.md },
  titleCompact: { fontSize: 24, lineHeight: 28 },
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
    flexWrap: 'wrap',
  },
  deadlineLabel: {
    color: colors.mutedInk,
    fontFamily: fontFamilies.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  deadlineValue: {
    flex: 1,
    minWidth: 0,
    color: colors.ink,
    fontFamily: fontFamilies.bodyBold,
    fontSize: 14,
  },
  arrow: { color: colors.blue, fontFamily: fontFamilies.bodyBold, fontSize: 22 },
  pressed: { opacity: 0.72 },
});
