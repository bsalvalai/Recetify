import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native'; // Importa Alert para mostrar mensajes de error
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
  const { setLoggedIn, setGuest } = useAuth();
  // *** NUEVOS ESTADOS PARA LA VERIFICACIÓN INICIAL ***
  const [isInitialCheckLoading, setIsInitialCheckLoading] = useState(true); // Para el spinner inicial
  const [initialCheckDone, setInitialCheckDone] = useState(false); // Para saber si la verificación ya terminó
  // ***************************************************

  const router = useRouter();
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'dapps1-2025';
  const URL_PUBLICA = "http://10.0.2.2:8080" // Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  // *** useEffect para la verificación inicial del usuario ***
  useEffect(() => {
    const performInitialCheck = async () => {
      try {
        setIsInitialCheckLoading(true); // Inicia el spinner
        setErrorMessage(''); // Limpia cualquier error previo

        if (!URL_PUBLICA) {
          console.error('URL_PUBLICA no está definida para la verificación inicial.');
          setErrorMessage('Error de configuración del servidor. Contacte al administrador.');
          setIsInitialCheckLoading(false);
          setInitialCheckDone(true);
          return; // No se puede proceder sin URL
        }

        const storedUsername = await AsyncStorage.getItem('username');

        if (storedUsername) {
          console.log('Username encontrado en AsyncStorage:', storedUsername);
          // Intenta obtener el perfil del usuario para validar su existencia
          try {
            // Agregar timeout de 5 segundos a la llamada axios
            const response = await Promise.race([
              axios.get(
                `${URL_PUBLICA}/user/profile/${storedUsername}`,
                {
                  headers: {
                    'x-api-key': API_KEY,
                  },
                  timeout: 5000, // 5 segundos de timeout
                }
              ),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ]) as any;

            if (response?.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
              // Si el perfil se obtiene correctamente, el usuario existe y está "logueado"
              console.log('Perfil de usuario validado:', response.data);
              setLoggedIn(true); // Marcar como logueado en el contexto
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
            console.log('Backend no disponible o sesión inválida, continuando al login manual');
            // No mostramos error aquí, simplemente dejamos que el usuario haga login manual
          }
        } else {
          console.log('No se encontró username en AsyncStorage.');
        }
      } catch (error) {
        console.error('Error general en la verificación inicial:', error);
        console.log('Error en verificación inicial, continuando al login manual');
        // No mostramos error aquí, simplemente dejamos que el usuario haga login manual
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
        Alert.alert('Error', 'Por favor, ingrese su nombre de usuario y contraseña.');
        return;
    }

    if (!URL_PUBLICA) {
      Alert.alert('Error de Configuración', 'La variable de entorno EXPO_PUBLIC_BACKEND_URL no está definida. Revise su archivo .env y el prefijo.');
      return;
    }

    try {
      console.log("Intentando iniciar sesión con:", { username, password });
      
      const response = await Promise.race([
        axios.post(
          // *** CORRECCIÓN 1: Usar backticks para el template literal de la URL ***
          `${URL_PUBLICA}/user/login`, 
          // *** CORRECCIÓN 2: El cuerpo de la solicitud va directamente aquí ***
          {
            username: username, 
            password: password,
          },
          // *** CORRECCIÓN 3: Las cabeceras van en una propiedad 'headers' (minúsculas) ***
          {
            headers: {
              'Content-Type': 'application/json', 
              'x-api-key': API_KEY,
            },
            timeout: 10000, // 10 segundos de timeout para login
          }
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]) as any;

      if (response.data) {
        await AsyncStorage.setItem('username', username); // Guarda el username al loguearse
        setLoggedIn(true); // Marcar como logueado en el contexto
        console.log("Usuario logueado y datos guardados en AsyncStorage:", response.data);
        router.replace('/(tabs)');
      } else {
        console.error("La respuesta del servidor no contiene datos esperados.");
        Alert.alert('Error de Login', 'No se pudo iniciar sesión. Respalda del servidor inesperada.');
      }
    } catch (error: any) {
      console.error("Error durante el login:", error);
      
      // Manejar timeout específicamente
      if (error.message === 'Timeout') {
        Alert.alert('Error de Conexión', 'El servidor tardó demasiado en responder. Verifique su conexión y que el servidor esté funcionando.');
        return;
      }
      
      // Manejo de errores más específico con Axios
      if (axios.isAxiosError(error) && error.response) {
        // El servidor respondió con un estado fuera del rango 2xx
        console.error("Error de respuesta del servidor:", error.response.status, error.response.data);
        if (error.response.status === 401) {
            Alert.alert('Login Fallido', 'Credenciales incorrectas. Verifique su usuario y contraseña.');
        } else if (error.response.status === 403) {
            Alert.alert('Acceso Denegado', 'No tiene permisos para acceder. Verifique su API Key.');
        } else {
            Alert.alert('Error del Servidor', error.response.data?.message || `Error al iniciar sesión. Código: ${error.response.status}`);
        }
      } else if (axios.isAxiosError(error) && error.request) {
        // La solicitud fue hecha pero no se recibió respuesta (ej. sin conexión a internet)
        console.error("No se recibió respuesta del servidor:", error.request);
        Alert.alert('Error de Conexión', 'No se pudo conectar al servidor. Verifique su conexión a internet.');
      } else {
        // Error inesperado
        Alert.alert('Error Inesperado', 'Ocurrió un error inesperado. Intente de nuevo.');
      }
    }
  };

  const handleContinueAsGuest = () => {
    setGuest(true); // Marcar como invitado en el contexto
    console.log('Continuando como invitado, navegando a (tabs)');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio de sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingrese su nombre de usuario..."
        placeholderTextColor="#000"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Ingrese su clave de ingreso..."
          placeholderTextColor="#000"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#111" />
        </Pressable>
      </View>

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
    //top: 12, // Comentado o ajustado si no es necesario para el posicionamiento vertical
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
  guestButton: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
    height: 54,
  },
  guestButtonText: {
    color: Colors.light.text,
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
});