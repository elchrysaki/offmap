import { colors, fontFamilies, spacing } from '@offmap/design';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ActionButton } from './action-button';
import { OffMapText } from './offmap-text';

const studentCollage = require('../../assets/images/offmap-student-collage.png');

const promises = [
  ['⌕', 'Find opportunities'],
  ['✦', 'Save your shortlist'],
  ['◎', 'All fields worldwide'],
  ['⌖', 'Checked by students'],
] as const;

export function CollageHero() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 880;
  const compact = width < 520;

  return (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, styles.decorations]}
      >
        <View style={styles.dots}>
          {Array.from({ length: 20 }, (_, index) => (
            <View key={index} style={styles.dot} />
          ))}
        </View>
        <Text style={styles.airplane}>✈</Text>
      </View>

      <View style={[styles.copy, wide && styles.copyWide]}>
        <OffMapText
          accessibilityRole="header"
          variant="display"
          style={[styles.headline, compact && styles.headlineCompact, wide && styles.headlineWide]}
        >
          your map{`\n`}to what’s{`\n`}possible
        </OffMapText>
        <View accessibilityElementsHidden style={styles.underline} />
        <OffMapText variant="subtitle" style={styles.subhead}>
          The student-first directory of opportunities worth knowing about.
        </OffMapText>
        <View style={styles.studentHighlight}>
          <OffMapText variant="bodyBold">Built by students, for students.</OffMapText>
        </View>
        <View style={styles.actions}>
          <ActionButton
            label="Explore opportunities"
            tone="blue"
            onPress={() => router.push('/opportunities')}
          />
          <ActionButton
            label="Add what you found"
            tone="lime"
            onPress={() => router.push('/submit')}
          />
        </View>
        <OffMapText variant="handwritten" style={styles.note}>
          explore. apply. grow. ↗
        </OffMapText>
      </View>

      <View style={[styles.visual, wide && styles.visualWide]}>
        <Image
          accessibilityLabel="Student holding books among a collage of travel, learning, and map imagery"
          source={studentCollage}
          contentFit="cover"
          style={styles.studentImage}
        />
        <View style={styles.stickyNote}>
          <View accessibilityElementsHidden style={styles.tape} />
          <OffMapText variant="handwritten" style={styles.stickyText}>
            discover{`\n`}save{`\n`}contribute
          </OffMapText>
        </View>
      </View>

      <View style={[styles.promiseStrip, wide && styles.promiseStripWide]}>
        {promises.map(([icon, label]) => (
          <View key={label} style={styles.promise}>
            <Text style={styles.promiseIcon}>{icon}</Text>
            <OffMapText variant="label" style={styles.promiseText}>
              {label}
            </OffMapText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    gap: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  heroWide: {
    minHeight: 720,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 40,
  },
  decorations: { pointerEvents: 'none' },
  dots: {
    position: 'absolute',
    left: '47%',
    top: '48%',
    width: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    opacity: 0.9,
  },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.blue },
  airplane: {
    position: 'absolute',
    right: '32%',
    top: 4,
    color: colors.ink,
    fontSize: 30,
    zIndex: 999,
    transform: [{ rotate: '-18deg' }],
  },
  routeLine: {
    position: 'absolute',
    left: '50%',
    top: 42,
    width: 160,
    height: 75,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.ink,
    borderRadius: 90,
    transform: [{ rotate: '8deg' }],
  },
  copy: { width: '100%', gap: spacing.lg, zIndex: 2 },
  copyWide: { flex: 1, minWidth: 360, maxWidth: 620 },
  headline: {
    fontSize: 52,
    lineHeight: 50,
    maxWidth: 650,
    letterSpacing: -2.4,
  },
  headlineCompact: { fontSize: 43, lineHeight: 42, letterSpacing: -2 },
  headlineWide: { fontSize: 76, lineHeight: 70, letterSpacing: -4 },
  underline: {
    height: 7,
    width: '86%',
    backgroundColor: colors.blue,
    borderRadius: 30,
    transform: [{ rotate: '-1deg' }],
  },
  subhead: { maxWidth: 520 },
  studentHighlight: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    backgroundColor: colors.lime,
    transform: [{ rotate: '-1deg' }],
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, paddingTop: spacing.sm },
  note: { color: colors.ink, transform: [{ rotate: '-2deg' }] },
  visual: {
    position: 'relative',
    width: '100%',
    maxWidth: 590,
    aspectRatio: 0.96,
    alignSelf: 'center',
  },
  visualWide: { flex: 1, minWidth: 390 },
  studentImage: {
    width: '100%',
    height: '100%',
    transform: [{ rotate: '0.7deg' }],
  },
  stickyNote: {
    position: 'absolute',
    right: 12,
    top: 18,
    minWidth: 150,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.lime,
    transform: [{ rotate: '4deg' }],
    boxShadow: '2px 5px 12px rgba(17,17,17,0.16)',
  },
  tape: {
    position: 'absolute',
    width: 66,
    height: 17,
    top: -9,
    left: 42,
    backgroundColor: colors.ink,
    transform: [{ rotate: '4deg' }],
  },
  stickyText: { color: colors.ink, fontSize: 24, lineHeight: 27 },
  promiseStrip: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
  },
  promiseStripWide: { flexBasis: '100%' },
  promise: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 150,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  promiseIcon: {
    color: colors.blue,
    fontFamily: fontFamilies.bodyBold,
    fontSize: 25,
  },
  promiseText: { flex: 1, color: colors.ink },
});
