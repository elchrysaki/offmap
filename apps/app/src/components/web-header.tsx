import { colors, fontFamilies, layout, radii, spacing } from '@offmap/design';
import { Link, usePathname } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const links = [
  ['Home', '/'],
  ['Opportunities', '/opportunities'],
  ['Saved', '/saved'],
  ['Submit', '/submit'],
  ['About', '/about'],
] as const;

export function WebHeader() {
  const pathname = usePathname();
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.shell} accessibilityLabel="Primary navigation">
      <View style={styles.header}>
        <Link href="/" asChild>
          <Pressable accessibilityLabel="OffMap home" style={styles.logo}>
            <Text style={styles.logoText}>OFFMAP</Text>
            <View style={styles.logoDot} />
          </Pressable>
        </Link>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nav}
        >
          {links.map(([label, href]) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} asChild>
                <Pressable
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <View style={[styles.link, active && styles.activeLink]}>
                    <Text style={[styles.linkText, active && styles.activeLinkText]}>{label}</Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </ScrollView>
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
  logo: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  logoText: {
    color: colors.ink,
    fontFamily: fontFamilies.display,
    fontSize: 23,
    letterSpacing: -1,
  },
  logoDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.orange, marginLeft: 3 },
  nav: { gap: spacing.sm, alignItems: 'center', paddingVertical: spacing.sm },
  link: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  activeLink: { backgroundColor: colors.ink },
  linkText: { color: colors.ink, fontFamily: fontFamilies.bodyMedium, fontSize: 15 },
  activeLinkText: { color: colors.white, fontFamily: fontFamilies.bodyBold },
  pressed: { opacity: 0.7 },
});
