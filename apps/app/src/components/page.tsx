import { colors, layout, spacing } from '@offmap/design';
import { Image } from 'expo-image';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ScrollViewProps,
} from 'react-native';

import { WebHeader } from './web-header';

export function Page({ children, contentContainerStyle, ...props }: ScrollViewProps) {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  return (
    <View style={styles.page}>
      <Image
        accessibilityElementsHidden
        source={require('../../assets/images/paper-texture.png')}
        contentFit="cover"
        style={styles.paperTexture}
      />
      <WebHeader />
      <ScrollView
        {...props}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          compact && styles.contentCompact,
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  paperTexture: { position: 'absolute', inset: 0, opacity: 0.38, pointerEvents: 'none' },
  scroll: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 112,
  },
  contentCompact: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 96,
  },
});
