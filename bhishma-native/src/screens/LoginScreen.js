import React, { Suspense } from 'react';
import { View, ActivityIndicator, InteractionManager, Platform } from 'react-native';

const GooglePanel = React.lazy(() => import('./LoginGooglePanel'));

export default function LoginScreen({ darkMode }) {
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <GooglePanel darkMode={darkMode} />
    </Suspense>
  );
}
