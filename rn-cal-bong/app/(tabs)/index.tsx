import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { useAppLaunchCount } from '@/hooks/use-app-launch-count';
import { useInterstitialAd } from '@/hooks/use-interstitial-ad';

const CALCULATOR_URL = 'https://calculator-virid-ten-64.vercel.app/';
const BG_COLOR = '#0e0f13';
const ADS_LAUNCH_THRESHOLD = 3;

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const { launchCount, ready } = useAppLaunchCount();
  const adsEnabled = ready && launchCount >= ADS_LAUNCH_THRESHOLD;
  const { onResultViewed, tryShowAd } = useInterstitialAd(adsEnabled);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'RESULT_VIEWED') {
          onResultViewed();
        } else if (data.type === 'GO_BACK' || data.type === 'GO_HOME') {
          tryShowAd();
        }
      } catch {
        // ignore non-JSON messages
      }
    },
    [onResultViewed, tryShowAd],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <WebView
          source={{ uri: CALCULATOR_URL }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onMessage={handleMessage}
          startInLoadingState
          allowsBackForwardNavigationGestures
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled={Platform.OS === 'android'}
        />
        {loading ? (
          <View style={styles.spinnerOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#f0f1f5" />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(14,15,19,0.85)',
  },
});
