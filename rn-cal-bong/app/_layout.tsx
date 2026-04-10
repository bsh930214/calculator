import { useEffect } from 'react';
import { Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import mobileAds from 'react-native-google-mobile-ads';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppLaunchCount } from '@/hooks/use-app-launch-count';

const ATT_LAUNCH_THRESHOLD = 3;

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { launchCount, ready } = useAppLaunchCount();

  useEffect(() => {
    if (!ready) return;

    (async () => {
      if (Platform.OS === 'ios' && launchCount >= ATT_LAUNCH_THRESHOLD) {
        await requestTrackingPermissionsAsync();
      }

      await mobileAds().initialize();
    })();
  }, [ready, launchCount]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
