import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

const CALCULATOR_URL = 'https://calculator-virid-ten-64.vercel.app/';
const BG_COLOR = '#0e0f13';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  // 결과 확인 횟수 카운트 (광고 노출 조건 체크용)
  const resultCount = useRef(0);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  // 웹앱에서 전송한 메시지 수신
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'RESULT_VIEWED') {
      // 결과 확인 카운트 증가
      resultCount.current += 1;
    }
    if (data.type === 'GO_BACK' || data.type === 'GO_HOME') {
      // 뒤로가기/홈 복귀 시 광고 노출 조건 체크
      // TODO: 광고 노출 로직 추가
    }
  }, []);

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
