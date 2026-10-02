// App.js
import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Fraunces_400Regular,
} from '@expo-google-fonts/fraunces';
import {
  Sora_400Regular,
} from '@expo-google-fonts/sora';
import { AuthProvider } from './src/context/AuthContext';
import { MusicProvider } from './src/context/MusicContext';
import RootNavigator from './src/navigation/RootNavigator';
import { WorldProvider } from './src/world/WorldContext';
import WorldBackground from './src/world/WorldBackground';

// Silence SafeAreaView deprecation notice from third-party navigation libraries
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces: Fraunces_400Regular,
    Sora: Sora_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MusicProvider>
          <WorldProvider>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <WorldBackground />
            <RootNavigator />
          </WorldProvider>
        </MusicProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}


