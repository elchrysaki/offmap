import '@/global.css';

import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { colors } from '@offmap/design';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from '@/providers/app-providers';

void SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  dark: false,
  colors: {
    primary: colors.blue,
    background: colors.paper,
    card: colors.paperRaised,
    text: colors.ink,
    border: colors.line,
    notification: colors.magenta,
  },
  fonts: {
    regular: { fontFamily: 'DMSans_400Regular', fontWeight: '400' as const },
    medium: { fontFamily: 'DMSans_500Medium', fontWeight: '500' as const },
    bold: { fontFamily: 'DMSans_700Bold', fontWeight: '700' as const },
    heavy: { fontFamily: 'ArchivoBlack_400Regular', fontWeight: '900' as const },
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ArchivoBlack_400Regular,
    Caveat_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <AppProviders>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="about" />
        </Stack>
      </AppProviders>
    </ThemeProvider>
  );
}
