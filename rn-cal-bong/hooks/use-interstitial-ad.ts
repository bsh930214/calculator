import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const IOS_AD_UNIT = 'ca-app-pub-5331327685576935/2067895798';
const ANDROID_AD_UNIT = 'ca-app-pub-5331327685576935/4642922398';
const PRODUCTION_AD_UNIT = Platform.select({
  ios: IOS_AD_UNIT,
  android: ANDROID_AD_UNIT,
}) ?? TestIds.INTERSTITIAL;

const AD_UNIT = __DEV__ ? TestIds.INTERSTITIAL : PRODUCTION_AD_UNIT;

const RESULT_THRESHOLD_1 = 2;
const RESULT_THRESHOLD_2 = 10;
const MAX_ADS_PER_SESSION = 2;

export function useInterstitialAd(adsEnabled: boolean) {
  const [adLoaded, setAdLoaded] = useState(false);
  const adRef = useRef<InterstitialAd | null>(null);
  const resultCount = useRef(0);
  const adsShownThisSession = useRef(0);
  const lastAdResultCount = useRef(0);

  const loadAd = useCallback(() => {
    if (!adsEnabled) return;
    const ad = InterstitialAd.createForAdRequest(AD_UNIT);
    ad.addAdEventListener(AdEventType.LOADED, () => setAdLoaded(true));
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      loadAd();
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      setAdLoaded(false);
      setTimeout(loadAd, 30_000);
    });
    ad.load();
    adRef.current = ad;
  }, [adsEnabled]);

  useEffect(() => {
    if (adsEnabled) loadAd();
    return () => {
      adRef.current?.removeAllListeners();
    };
  }, [adsEnabled, loadAd]);

  const onResultViewed = useCallback(() => {
    resultCount.current += 1;
  }, []);

  const tryShowAd = useCallback((): boolean => {
    if (!adsEnabled || !adLoaded || !adRef.current) return false;
    if (adsShownThisSession.current >= MAX_ADS_PER_SESSION) return false;

    const count = resultCount.current;
    const shown = adsShownThisSession.current;

    let shouldShow = false;
    if (shown === 0 && count >= RESULT_THRESHOLD_1) {
      shouldShow = true;
    } else if (shown === 1 && count >= RESULT_THRESHOLD_2) {
      shouldShow = true;
    }

    if (shouldShow && count > lastAdResultCount.current) {
      adRef.current.show();
      adsShownThisSession.current += 1;
      lastAdResultCount.current = count;
      return true;
    }

    return false;
  }, [adsEnabled, adLoaded]);

  return { onResultViewed, tryShowAd };
}
