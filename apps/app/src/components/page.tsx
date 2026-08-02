import { colors, layout, spacing } from '@offmap/design';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';

import { WebHeader } from './web-header';

export function Page({ children, contentContainerStyle, ...props }: ScrollViewProps) {
  return (
    <View style={styles.page}>
      <WebHeader />
      <ScrollView
        {...props}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  scroll: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 112,
  },
});
