import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { use, useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const API_KEY = 'dapps1-2025'; // Your API Key
const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL 

export const unstable_settings = {
  initialRouteName: '(auth)', // This is a default setting, which will be overridden by Redirect
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    RobotoRegular: require('../assets/fonts/Roboto-Regular.ttf'),
    RobotoBold: require('../assets/fonts/Roboto-Bold.ttf')
    //...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const [isAuth, setAuth] = useState(false);

  useEffect(() => {
    try {
      //ACA HAGO LA LOGICA DEL ASYNC STORAGE
      const token = async () => {
        const storedToken = await AsyncStorage.getItem("username");
        if (storedToken) {
          // Aquí puedes usar el token almacenado
          console.log('Token recuperado:', storedToken);
          setAuth(true);
        } else {
          console.log('No se encontró ningún token almacenado.');
        }
      }
    }
    catch (error) {
      console.error('Error loading FontAwesome font:', error);
    }
  },[])

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
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}