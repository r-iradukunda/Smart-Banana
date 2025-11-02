import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useNotifications } from '@/components/ui/NotificationManager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { NotificationManager, showInfo, showError } = useNotifications();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      initializeApp();
    }
  }, [loaded]);

  const initializeApp = async () => {
    try {
      // Check if this is the first launch
      const hasLaunched = await AsyncStorage.getItem('@has_launched');
      if (!hasLaunched) {
        showInfo(
          'Welcome to Banana Guard!',
          'AI-powered disease detection for your banana plants',
          6000
        );
        await AsyncStorage.setItem('@has_launched', 'true');
      }

      // Request location permissions in background
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (err) {
        console.warn('Location permission not granted:', err);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      showError(
        'Initialization Error',
        'Some features may not work properly',
        5000
      );
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        <NotificationManager />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
