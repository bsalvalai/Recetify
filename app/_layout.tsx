import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
<<<<<<< Updated upstream
=======
import { AuthProvider } from '@/components/AuthContext';
import axios from 'axios';
import { CommonActions, NavigationContainerRef } from '@react-navigation/native'; // <--- Importa estos también
>>>>>>> Stashed changes

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

<<<<<<< Updated upstream
=======
const API_KEY = 'dapps1-2025'; // Your API Key
const URL_PUBLICA = "http://10.0.2.2:8080" // Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

// <--- DEFINE Y EXPORTA navigationRef AQUÍ
export const navigationRef = createRef<NavigationContainerRef<any>>();

// <--- Función helper para navegar a los tabs (la puedes usar desde cualquier lugar)
export function navigateToTabsHome() {
  // Envuelve la lógica de navegación en un setTimeout
  setTimeout(() => {
    console.log("Intentando navegar después de timeout. navigationRef.current:", navigationRef.current);
    if (navigationRef.current) {
      console.log("navigationRef.current.isReady():", navigationRef.current.isReady());
    }

    if (navigationRef.current?.isReady()) {
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: '(tabs)' }],
        })
      );
      console.log("Navegación a /(tabs) con CommonActions.reset dispatcheada.");
    } else {
      console.warn("Navigation ref aún no lista DESPUÉS DEL TIMEOUT. Fallback o depuración adicional necesaria.");
      // **DEBUGGING TIP:** Si esto sigue fallando, intenta un router.replace() aquí como último recurso,
      // asumiendo que tu componente tiene acceso al router.
      // import { useRouter } from 'expo-router'; // Esto no funcionaría directamente aquí si no es un componente.
      // Por eso el navigationRef es para navegación global.
    }
  }, 300); // Intenta 300 milisegundos (0.3 segundos). Puedes probar con 500 si 300 no es suficiente.
}
// FIN de la función helper


>>>>>>> Stashed changes
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
<<<<<<< Updated upstream
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
=======
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>
        {/* <--- PASA EL REF AL STACK AQUÍ */}
        <Stack ref={navigationRef}>
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
    </AuthProvider>
>>>>>>> Stashed changes
  );
}