import { colors, fontFamilies } from '@offmap/design';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

const logoMark = require('../../assets/images/offmap-logo-mark.png');

export function OffMapLogo({ compact = false }: { compact?: boolean }) {
  return (
    <View accessibilityLabel="OffMap" style={[styles.logo, compact && styles.logoCompact]}>
      <Image
        accessibilityElementsHidden
        source={logoMark}
        contentFit="contain"
        style={compact ? styles.markCompact : styles.mark}
      />
      <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>OffMap</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCompact: { width: 112, height: 36, minHeight: 36 },
  mark: { width: 48, height: 56 },
  markCompact: { width: 28, height: 34 },
  wordmark: {
    color: colors.ink,
    fontFamily: fontFamilies.bodyBold,
    fontSize: 30,
    letterSpacing: -1.5,
  },
  wordmarkCompact: { fontSize: 21, letterSpacing: -1 },
});
