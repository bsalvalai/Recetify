import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen'; // Importa SplashScreen
// axios y Constants ya no son necesarios en este hook si no validas con backend aquí
// import axios from 'axios';
// import Constants from 'expo-constants';

// *** CAMBIO AQUÍ: La clave del token es ahora "username" ***
const AUTH_TOKEN_KEY = 'username'; 
// LOGGED_IN_USERNAME_KEY se vuelve redundante si el token es el username

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true); // Indica si estamos verificando el token
  const [isAuthenticated, setIsAuthenticated] = useState(false); // true si el usuario está logueado
  const [authToken, setAuthToken] = useState<string | null>(null); // El token del usuario (que será el nombre de usuario)
  const [username, setUsernameState] = useState<string | null>(null); // El nombre de usuario (redundante con authToken pero mantenido para claridad si se prefiere)

  // Si no vas a validar el token con el backend en este hook,
  // puedes eliminar las siguientes líneas:
  // const BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
  // const API_KEY = 'dapps1-2025';

  // La función de validación con el backend se eliminará de aquí,
  // o se moverá a donde realmente se necesite (ej. antes de llamadas a API protegidas).
  // const validateTokenWithBackend = useCallback(async (token: string) => { /* ... */ }, []);


  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true); // Inicia el estado de carga
      // *** CAMBIO AQUÍ: Usamos AUTH_TOKEN_KEY que ahora es 'username' ***
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY); // Obtiene el "username" almacenado

      if (storedToken) {
        // Si el "username" (token) existe, asumimos que el usuario está autenticado
        setAuthToken(storedToken);
        setUsernameState(storedToken); // El username es el mismo que el token en este caso
        setIsAuthenticated(true);
      } else {
        // No se encontró ningún "username" (token)
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al verificar el estado de autenticación:', error);
      setIsAuthenticated(false); // Asume no autenticado en caso de error inesperado
    } finally {
      setIsLoading(false); // Finaliza el estado de carga
      SplashScreen.hideAsync(); // Oculta el SplashScreen
    }
  }, []); // Dependencias vacías ya que no depende de props o estados externos para esta lógica

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Función para ser llamada desde LoginScreen al "login" exitoso
  const login = useCallback(async (tokenToStore: string) => { // Eliminé newUsername ya que es igual a tokenToStore
    try {
      // *** CAMBIO AQUÍ: Usamos AUTH_TOKEN_KEY que ahora es 'username' ***
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, tokenToStore); // Almacena el "username"
      setAuthToken(tokenToStore);
      setUsernameState(tokenToStore); // El username es el mismo que el token
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al guardar credenciales en AsyncStorage:', error);
    }
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    try {
      // *** CAMBIO AQUÍ: Usamos AUTH_TOKEN_KEY que ahora es 'username' ***
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setAuthToken(null);
      setUsernameState(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error al eliminar credenciales de AsyncStorage:', error);
    }
  }, []);

  return { isLoading, isAuthenticated, authToken, username, login, logout, checkAuthStatus };
};