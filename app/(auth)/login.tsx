import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useNavigation } from 'expo-router';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '@/components/AuthContext';
export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();
  const { setGuest } = useAuth();
  // *** NUEVOS ESTADOS PARA LA VERIFICACIÓN INICIAL ***
  const [isInitialCheckLoading, setIsInitialCheckLoading] = useState(true); // Para el spinner inicial
  const [initialCheckDone, setInitialCheckDone] = useState(false); // Para saber si la verificación ya terminó
  // ***************************************************

  const router = useRouter();
  const API_KEY = 'dapps1-2025';

  const URL_PUBLICA = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  // *** useEffect para la verificación inicial del usuario ***
  useEffect(() => {
    const performInitialCheck = async () => {
      try {
        setIsInitialCheckLoading(true); // Inicia el spinner
        setErrorMessage(''); // Limpia cualquier error previo

        if (!URL_PUBLICA) {
          console.error('URL_PUBLICA no está definida para la verificación inicial.');
          setErrorMessage('Error de configuración del servidor. Contacte al administrador.');
          return; // No se puede proceder sin URL
        }

        const storedUsername = await AsyncStorage.getItem('username');

        if (storedUsername) {
          console.log('Username encontrado en AsyncStorage:', storedUsername);
          // Intenta obtener el perfil del usuario para validar su existencia
          try {
            const response = await axios.get(
              `${URL_PUBLICA}/user/profile/${storedUsername}`,
              {
                headers: {
                  'x-api-key': API_KEY,
                },
              }
            );

            if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
              // Si el perfil se obtiene correctamente, el usuario existe y está "logueado"
              console.log('Perfil de usuario validado:', response.data);
              navigation.dispatch(
                CommonActions.reset({
                  index: 0, // El índice de la ruta activa en la nueva pila
                  routes: [
                    { name: '(tabs)' }, // La única ruta en la nueva pila será 'Home'
                  ],
                })
              ); // Redirige a la sección de tabs
              return; // Detiene la ejecución para evitar mostrar el formulario
            } else {
              // El backend respondió OK, pero no hay datos de perfil (usuario no existe o está inactivo)
              console.log('Backend respondió OK, pero perfil no encontrado para:', storedUsername);
              await AsyncStorage.removeItem('username'); // Limpia el username inválido
            }
          } catch (error) {
            // Error al validar con el backend (ej. 404 Not Found, 401 Unauthorized, error de red)
            console.error('Error al validar username con backend:', error);
            await AsyncStorage.removeItem('username'); // Limpia el username si la validación falla
            setErrorMessage('Sesión anterior inválida o expirada. Por favor, inicie sesión de nuevo.');
          }
        } else {
          console.log('No se encontró username en AsyncStorage.');
        }
      } catch (error) {
        console.error('Error general en la verificación inicial:', error);
        setErrorMessage('Ocurrió un error en la verificación inicial. Intente de nuevo.');
      } finally {
        setIsInitialCheckLoading(false); // Oculta el spinner
        setInitialCheckDone(true); // Marca que la verificación ha terminado
      }
    };

    performInitialCheck();
  }, []); // Se ejecuta solo una vez al montar el componente

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleNext = async () => {
    setErrorMessage(''); // Limpiar mensaje de error previo

    if (!username || !password) {
      setErrorMessage('Por favor, ingrese su nombre de usuario y contraseña.');
      return;
    }

    if (!URL_PUBLICA) {
      setErrorMessage('Error de configuración del servidor. Por favor, contacte al administrador.');
      return;
    }

    try {
      //console.log("Intentando iniciar sesión manualmente con:", { username, password });

      console.log(`Haciendo POST a: ${URL_PUBLICA}/user/login con datos:`, { username, password });
      const response = await axios.post(
        `${URL_PUBLICA}/user/login`,
        {
          username: username,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      if (response.data) {
        await AsyncStorage.setItem('username', username); // Guarda el username al loguearse
        console.log("Usuario logueado y datos guardados en AsyncStorage:", response.data);
        navigation.dispatch(
                CommonActions.reset({
                  index: 0, // El índice de la ruta activa en la nueva pila
                  routes: [
                    { name: '(tabs)' }, // La única ruta en la nueva pila será 'Home'
                  ],
                })
              );
      } else {
        console.error("La respuesta del servidor no contiene datos esperados.");
        setErrorMessage('Error de inicio de sesión. Respuesta del servidor inesperada.');
      }
    } catch (error) {
      console.error("Error durante el login manual:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error de respuesta del servidor:", error.response.status, error.response.data);
        if (error.response.status === 401) {
          setErrorMessage('Credenciales incorrectas. Verifique su usuario y contraseña.');
          setUsername('');
          setPassword('');
        } else if (error.response.status === 403) {
          setErrorMessage('Acceso denegado. No tiene permisos para acceder.');
        } else {
          setErrorMessage(error.response.data?.message || `Error del servidor (${error.response.status})`);
        }
      } else if (axios.isAxiosError(error) && error.request) {
        console.error("No se recibió respuesta del servidor:", error.request);
        setErrorMessage('No se pudo conectar al servidor. Verifique su conexión a internet.');
      } else {
        setErrorMessage('Error inesperado durante el inicio de sesión.');
      }
    }
  };

  const handleContinueAsGuest = () => {
    setGuest(true); // Establecer al usuario como invitado
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: '(tabs)' }],
      })
    );
  };

  // *** RENDERIZADO CONDICIONAL ***
  if (isInitialCheckLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }

  // Si la verificación inicial terminó y no llevó a (tabs), muestra el formulario de login
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio de sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingrese su nombre de usuario..."
        placeholderTextColor="#000"
        value={username}
        onChangeText={handleUsernameChange}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Ingrese su clave de ingreso..."
          placeholderTextColor="#000"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={handlePasswordChange}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#111" />
        </Pressable>
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <TouchableOpacity onPress={() => router.push('/(auth)/(recupero)/recupero')}>
        <Text style={styles.forgotText}>
          ¿Olvidaste tu clave de ingreso? Presiona aqui
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.guestButton}
        onPress={handleContinueAsGuest}
      >
        <Text style={styles.guestButtonText}>Continuar sin cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 60,
    color: '#111',
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.light.textInput,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 40,
    width: '100%',
    height: 46,
    color: '#111',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 10,
    fontWeight: '500',
  },
  forgotText: {
    color: '#444',
    fontSize: 14,
    marginBottom: 35,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    height: 54,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: "bold",
  },
  // *** NUEVOS ESTILOS PARA LA PANTALLA DE CARGA INICIAL ***
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.button,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
    height: 54,
  },
  guestButtonText: {
    color: Colors.light.button,
    fontSize: 14,
    fontWeight: "bold",
  },
});