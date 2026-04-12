import { registerRootComponent } from 'expo';
import { TurboModuleRegistry } from 'react-native';
import App from './App';

// Ensure Expo native modules are installed before the root component runs (helps expo-web-browser).
try {
  const core = TurboModuleRegistry.get?.('ExpoModulesCore');
  core?.installModules?.();
} catch (e) {
  console.warn('ExpoModulesCore.installModules:', e?.message || e);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
