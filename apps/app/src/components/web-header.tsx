import { colors, fontFamilies, layout, radii, spacing } from '@offmap/design';
import { Link, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { OffMapLogo } from './offmap-logo';

const links = [
  ['Home', 'Home', '/'],
  ['Opportunities', 'Explore', '/opportunities'],
  ['Saved', 'Saved', '/saved'],
  ['Submit', 'Add', '/submit'],
  ['About', 'About', '/about'],
] as const;

export function WebHeader() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < 700;
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.shell} accessibilityLabel="Primary navigation">
      <View style={[styles.header, compact && styles.headerCompact]}>
        <Link href="/" asChild>
          <Pressable accessibilityLabel="OffMap home" style={styles.logo}>
            <OffMapLogo compact={compact} />
          </Pressable>
        </Link>
        <View style={[styles.nav, compact && styles.navCompact]}>
          {links.map(([label, compactLabel, href]) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} asChild>
                <Pressable
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <View style={[styles.link, active && styles.activeLink]}>
                    <Text style={[styles.linkText, active && styles.activeLinkText]}>
                      {compact ? compactLabel : label}
                    </Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    backgroundColor: colors.paper,
  },
  header: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    minHeight: 76,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  headerCompact: {
    minHeight: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  logo: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  nav: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: spacing.sm,
  },
  navCompact: { width: '100%', justifyContent: 'center', paddingVertical: 0 },
  link: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  linkText: { color: colors.ink, fontFamily: fontFamilies.bodyMedium, fontSize: 15 },
  activeLink: { backgroundColor: colors.ink },
  activeLinkText: { color: colors.white, fontFamily: fontFamilies.bodyBold },
  pressed: { opacity: 0.7 },
});
