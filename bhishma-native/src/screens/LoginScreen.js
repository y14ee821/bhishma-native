import React, { Suspense } from 'react';
import { View, ActivityIndicator, InteractionManager, Platform } from 'react-native';
import { getTheme } from '../styles';

const GooglePanel = React.lazy(() => import('./LoginGooglePanel'));

export default function LoginScreen({ darkMode }) {
  const t = getTheme(darkMode);
  const [deferred, setDeferred] = React.useState(Platform.OS === 'web');

  React.useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      setDeferred(true);
    });
    return () => task?.cancel?.();
  }, []);

  if (!deferred) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.loaderBg }}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.loaderBg }}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      }
    >
      <GooglePanel darkMode={darkMode} />
    </Suspense>
  );
}
