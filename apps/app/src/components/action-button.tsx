import { colors, fontFamilies, layout, radii, spacing } from '@offmap/design';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

type Tone = 'ink' | 'blue' | 'lime' | 'orange' | 'magenta' | 'paper';

const paintAssets = {
  blue: require('../../assets/images/paint-blue.png'),
  lime: require('../../assets/images/paint-lime.png'),
  orange: require('../../assets/images/paint-orange.png'),
  magenta: require('../../assets/images/paint-magenta.png'),
} as const;

export function ActionButton({
  label,
  tone = 'ink',
  busy = false,
  style,
  ...props
}: PressableProps & { label: string; tone?: Tone; busy?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isLight = tone === 'lime' || tone === 'orange' || tone === 'magenta' || tone === 'paper';
  const paint = tone in paintAssets ? paintAssets[tone as keyof typeof paintAssets] : null;
  const selected = props.accessibilityState?.selected;
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      disabled={props.disabled || busy}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onHoverIn={(event) => {
        setHovered(true);
        props.onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        props.onHoverOut?.(event);
      }}
      style={(state) => [
        styles.base,
        styles[tone],
        hovered && styles.hovered,
        focused && styles.focused,
        selected && styles.selected,
        state.pressed && styles.pressed,
        (props.disabled || busy) && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {paint ? (
        <Image
          accessibilityElementsHidden
          source={paint}
          contentFit="fill"
          style={[styles.paint, hovered && styles.paintHovered]}
        />
      ) : null}
      {busy ? (
        <ActivityIndicator color={isLight ? colors.ink : colors.white} />
      ) : (
        <Text style={[styles.label, isLight ? styles.darkLabel : styles.lightLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'relative',
    minHeight: layout.minimumTouchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    overflow: 'hidden',
    boxShadow: '4px 4px 0 #111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ink: { backgroundColor: colors.ink },
  blue: { backgroundColor: colors.blue },
  lime: { backgroundColor: colors.lime },
  orange: { backgroundColor: colors.orange },
  magenta: { backgroundColor: colors.magenta },
  paper: { backgroundColor: colors.paperRaised },
  paint: {
    position: 'absolute',
    left: -8,
    right: -8,
    top: -6,
    bottom: -6,
    opacity: 0.82,
  },
  paintHovered: { opacity: 1 },
  label: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  lightLabel: { color: colors.white },
  darkLabel: { color: colors.ink },
  hovered: { transform: [{ translateY: -2 }], boxShadow: '6px 7px 0 #111111' },
  focused: {
    borderColor: colors.focus,
    borderWidth: 3,
    boxShadow: '0 0 0 3px rgba(18,104,255,0.25), 4px 4px 0 #111111',
  },
  selected: { borderWidth: 3, boxShadow: 'inset 0 0 0 2px #FFF9EC, 4px 4px 0 #111111' },
  pressed: { opacity: 0.92, transform: [{ translateY: 2 }], boxShadow: '1px 1px 0 #111111' },
  disabled: { opacity: 0.48, boxShadow: 'none' },
});
