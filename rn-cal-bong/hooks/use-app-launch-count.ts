import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@sigma/launch_count';

export function useAppLaunchCount() {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const prev = stored ? parseInt(stored, 10) : 0;
      const next = prev + 1;
      await AsyncStorage.setItem(STORAGE_KEY, String(next));
      setCount(next);
      setReady(true);
    })();
  }, []);

  return { launchCount: count, ready };
}
