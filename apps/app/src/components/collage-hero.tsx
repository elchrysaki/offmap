import { colors, fontFamilies, radii, spacing } from '@offmap/design';
import { Link } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ActionButton } from './action-button';
import { OffMapText } from './offmap-text';

export function CollageHero() {
  const { width } = useWindowDimensions();
  const wide = width >= 820;
  return (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, styles.decorations]}
      >
        <View style={styles.bluePaper} />
        <View style={styles.orangePaper} />
        <View style={styles.magentaDot} />
        <View style={styles.violetTape} />
        <View style={styles.routeLine} />
        <Text style={styles.routeStar}>✦</Text>
      </View>

      <View style={[styles.copy, wide && styles.copyWide]}>
        <View style={styles.eyebrow}>
          <OffMapText variant="label">Built by students · checked by humans</OffMapText>
        </View>
        <OffMapText
          accessibilityRole="header"
          variant="display"
          style={[styles.headline, wide && styles.headlineWide]}
        >
          YOUR MAP TO{`\n`}WHAT’S POSSIBLE
        </OffMapText>
        <View style={styles.underline} />
        <OffMapText variant="subtitle" style={styles.subhead}>
          Worthwhile opportunities, pulled out of forgotten newsletters, chaotic spreadsheets, and
          the group chat you meant to search later.
        </OffMapText>
        <View style={styles.actions}>
          <Link href="/opportunities" asChild>
            <ActionButton label="Explore opportunities" tone="ink" />
          </Link>
          <Link href="/submit" asChild>
            <ActionButton label="Add what you found" tone="lime" />
          </Link>
        </View>
        <OffMapText variant="handwritten" style={styles.note}>
          no account. no noise. just a place to start ↗
        </OffMapText>
      </View>

      {wide ? (
        <View style={styles.poster} accessibilityLabel="Discover, save, contribute">
          <Text style={styles.posterNumber}>01</Text>
          <Text style={styles.posterWord}>DISCOVER</Text>
          <View style={[styles.posterBand, styles.posterOrange]}>
            <Text style={styles.posterBandText}>SAVE THE GOOD ONES</Text>
          </View>
          <View style={[styles.posterBand, styles.posterBlue]}>
            <Text style={[styles.posterBandText, styles.posterBandLight]}>PASS ONE ON</Text>
          </View>
          <Text style={styles.posterFooter}>STUDENT-FIRST · WORLDWIDE</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 590,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.large,
    backgroundColor: colors.paperRaised,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  heroWide: { minHeight: 650, padding: 48, flexDirection: 'row', alignItems: 'center', gap: 48 },
  decorations: { pointerEvents: 'none' },
  copy: { gap: spacing.lg, zIndex: 2 },
  copyWide: { flex: 1.25 },
  eyebrow: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.lime,
    borderWidth: 2,
    borderColor: colors.ink,
    transform: [{ rotate: '-1deg' }],
  },
  headline: { fontSize: 44, lineHeight: 45, maxWidth: 650 },
  headlineWide: { fontSize: 68, lineHeight: 66, letterSpacing: -3 },
  underline: {
    height: 8,
    width: '74%',
    backgroundColor: colors.orange,
    transform: [{ rotate: '-1deg' }],
  },
  subhead: { maxWidth: 650 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  note: { color: colors.violet, transform: [{ rotate: '-1deg' }] },
  bluePaper: {
    position: 'absolute',
    width: 280,
    height: 190,
    right: -90,
    top: -35,
    backgroundColor: colors.blue,
    transform: [{ rotate: '13deg' }],
  },
  orangePaper: {
    position: 'absolute',
    width: 170,
    height: 100,
    left: -55,
    bottom: 40,
    backgroundColor: colors.orange,
    transform: [{ rotate: '-12deg' }],
  },
  magentaDot: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    right: 40,
    bottom: 32,
    backgroundColor: colors.magenta,
  },
  violetTape: {
    position: 'absolute',
    width: 130,
    height: 30,
    right: 245,
    top: 20,
    backgroundColor: 'rgba(110,75,255,0.55)',
    transform: [{ rotate: '-5deg' }],
  },
  routeLine: {
    position: 'absolute',
    width: 150,
    height: 90,
    left: 25,
    top: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.ink,
    borderRadius: 80,
    transform: [{ rotate: '-12deg' }],
  },
  routeStar: { position: 'absolute', left: 155, top: 93, fontSize: 30, color: colors.ink },
  poster: {
    width: 310,
    minHeight: 420,
    padding: spacing.xl,
    backgroundColor: colors.paper,
    borderWidth: 3,
    borderColor: colors.ink,
    boxShadow: '9px 10px 0 rgba(18, 18, 18, 0.22)',
    elevation: 5,
    transform: [{ rotate: '2deg' }],
    justifyContent: 'space-between',
  },
  posterNumber: { fontFamily: fontFamilies.handwritten, fontSize: 34, color: colors.orange },
  posterWord: { fontFamily: fontFamilies.display, fontSize: 42, lineHeight: 44, color: colors.ink },
  posterBand: {
    padding: spacing.md,
    marginHorizontal: -34,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  posterOrange: { backgroundColor: colors.orange, transform: [{ rotate: '-2deg' }] },
  posterBlue: { backgroundColor: colors.blue, transform: [{ rotate: '1deg' }] },
  posterBandText: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
  posterBandLight: { color: colors.white },
  posterFooter: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.mutedInk,
  },
});
