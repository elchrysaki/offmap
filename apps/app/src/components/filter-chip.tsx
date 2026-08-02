import { colors, fontFamilies, layout, radii, spacing } from '@offmap/design';
import { Pressable, StyleSheet, Text } from 'react-native';

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.base, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
        {count ? ` · ${count}` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minimumTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paperRaised,
  },
  selected: { backgroundColor: colors.lime },
  pressed: { opacity: 0.7 },
  label: { color: colors.ink, fontFamily: fontFamilies.bodyMedium, fontSize: 14 },
  selectedLabel: { fontFamily: fontFamilies.bodyBold },
});
