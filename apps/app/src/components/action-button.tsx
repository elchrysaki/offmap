import { colors, fontFamilies, layout, radii, spacing } from '@offmap/design';
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

type Tone = 'ink' | 'blue' | 'lime' | 'paper';

export function ActionButton({
  label,
  tone = 'ink',
  busy = false,
  style,
  ...props
}: PressableProps & { label: string; tone?: Tone; busy?: boolean }) {
  const isLight = tone === 'lime' || tone === 'paper';
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      disabled={props.disabled || busy}
      style={(state) => [
        styles.base,
        styles[tone],
        state.pressed && styles.pressed,
        (props.disabled || busy) && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
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
    minHeight: layout.minimumTouchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ink: { backgroundColor: colors.ink },
  blue: { backgroundColor: colors.blue },
  lime: { backgroundColor: colors.lime },
  paper: { backgroundColor: colors.paperRaised },
  label: { fontFamily: fontFamilies.bodyBold, fontSize: 15, lineHeight: 20 },
  lightLabel: { color: colors.white },
  darkLabel: { color: colors.ink },
  pressed: { opacity: 0.78, transform: [{ translateY: 1 }] },
  disabled: { opacity: 0.5 },
});
