import { colors, radii, spacing } from '@offmap/design';
import { StyleSheet, View } from 'react-native';

import { ActionButton } from './action-button';
import { OffMapText } from './offmap-text';

export function StatePanel({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.panel} accessibilityRole="summary">
      <OffMapText variant="title">{title}</OffMapText>
      <OffMapText style={styles.message}>{message}</OffMapText>
      {actionLabel && onAction ? (
        <ActionButton label={actionLabel} tone="paper" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.large,
    backgroundColor: colors.paperRaised,
  },
  message: { color: colors.mutedInk },
});
