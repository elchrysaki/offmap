import { colors, fontFamilies } from '@offmap/design';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function NativeTabLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.paperRaised}
      iconColor={{ default: colors.mutedInk, selected: colors.ink }}
      indicatorColor={colors.lime}
      labelStyle={{
        default: { color: colors.mutedInk, fontFamily: fontFamilies.bodyMedium, fontSize: 12 },
        selected: { color: colors.ink, fontFamily: fontFamilies.bodyBold, fontSize: 12 },
      }}
    >
      <NativeTabs.Trigger name="(discover)">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'safari', selected: 'safari.fill' }}
          md={{ default: 'explore', selected: 'explore' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="saved">
        <NativeTabs.Trigger.Label>Saved</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bookmark', selected: 'bookmark.fill' }}
          md={{ default: 'bookmark_border', selected: 'bookmark' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="submit">
        <NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }}
          md={{ default: 'add_circle_outline', selected: 'add_circle' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
