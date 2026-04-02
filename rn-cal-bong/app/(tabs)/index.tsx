import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const CALCULATOR_URL = 'https://calculator-virid-ten-64.vercel.app/';
const BG_COLOR = '#0e0f13';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <WebView
          source={{ uri: CALCULATOR_URL }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
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
