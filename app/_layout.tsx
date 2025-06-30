import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import axios from 'axios';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const API_KEY = 'dapps1-2025'; // Your API Key
const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL 

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const pingEndpoint = `${URL_PUBLICA}/ping`;
        console.log(`Intentando hacer ping al servidor en: ${pingEndpoint}`);

        const response = await axios.get(pingEndpoint, {
          headers: {
            'x-api-key': API_KEY, // Asegúrate de que tu API Key esté configurada correctamente
          },
        }
        );

        console.log('Respuesta del servidor al ping:', response.data);

        // La API de ping devuelve "pong" directamente como texto en la respuesta
        if (response.data === "pong") {
          
          console.log('Conexión con la base de datos establecida (recibido "pong").');
        } else {
          console.log('El servidor respondió, pero no con "pong". Respuesta:', response.data);
        }
      } catch (error) {
        console.error('Error al hacer ping al servidor:', error);
      }
    };
    checkServerStatus();
  }, []);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    RobotoRegular: require('../assets/fonts/Roboto-Regular.ttf'),
    RobotoBold: require('../assets/fonts/Roboto-Bold.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="RecipePreviewScreen" options={{ headerShown: false }} />
        <Stack.Screen name="Step" options={{ headerShown: false }} />
        <Stack.Screen name="editarperfil" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="ayuda" options={{ headerShown: false }} />
        <Stack.Screen name="cambiarclave" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}