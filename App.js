import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { theme } from './src/theme/theme';
import RootNavigator from './src/navigation/RootNavigator';
import './src/i18n';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
}
