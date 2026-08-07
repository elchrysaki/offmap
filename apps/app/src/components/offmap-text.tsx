import { colors, fontFamilies, typeScale } from '@offmap/design';
import { StyleSheet, Text, type TextProps } from 'react-native';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'bodyBold' | 'label' | 'handwritten';

export function OffMapText({
  variant = 'body',
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  return <Text {...props} allowFontScaling style={[styles.base, styles[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.ink,
    fontFamily: fontFamilies.body,
    fontSize: typeScale.body,
    lineHeight: 24,
    flexShrink: 1,
  },
  display: {
    fontFamily: fontFamilies.display,
    fontSize: typeScale.display,
    lineHeight: 50,
    letterSpacing: -1.8,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: typeScale.title,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: typeScale.bodyLarge,
    lineHeight: 27,
  },
  body: {},
  bodyBold: {
    fontFamily: fontFamilies.bodyBold,
  },
  label: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: typeScale.label,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  handwritten: {
    fontFamily: fontFamilies.handwritten,
    fontSize: 24,
    lineHeight: 28,
  },
});
