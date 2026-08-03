import { colors, fontFamilies, layout, radii, spacing } from '@offmap/design';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const selectedPaint = require('../../assets/images/paint-lime.png');

export function FilterChip({
  label,
  selected,
  onPress,
  count,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        hovered && styles.hovered,
        focused && styles.focused,
        pressed && styles.pressed,
      ]}
    >
      {selected ? (
        <Image
          accessibilityElementsHidden
          source={selectedPaint}
          contentFit="fill"
          style={styles.paint}
        />
      ) : null}
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {selected ? '✓ ' : ''}
        {label}
        {count ? ` · ${count}` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'relative',
    flexShrink: 1,
    maxWidth: '100%',
    minHeight: layout.minimumTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paperRaised,
    boxShadow: '2px 2px 0 rgba(17,17,17,0.78)',
  },
  selected: { backgroundColor: colors.lime, borderWidth: 3 },
  paint: {
    position: 'absolute',
    left: -5,
    right: -5,
    top: -4,
    bottom: -4,
    opacity: 0.62,
  },
  hovered: { transform: [{ translateY: -1 }], boxShadow: '3px 4px 0 #111111' },
  focused: {
    borderColor: colors.focus,
    borderWidth: 3,
    boxShadow: '0 0 0 3px rgba(18,104,255,0.25), 2px 2px 0 #111111',
  },
  pressed: { opacity: 0.82, transform: [{ translateY: 1 }], boxShadow: 'none' },
  label: {
    color: colors.ink,
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 14,
    flexShrink: 1,
  },
  selectedLabel: { fontFamily: fontFamilies.bodyBold },
});
