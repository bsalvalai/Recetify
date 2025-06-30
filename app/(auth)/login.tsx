import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants'; // Importa Constants para acceder a variables de entorno


export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const API_KEY = 'dapps1-2025'

  // Accede a la URL pública de forma segura
  const URL_PUBLICA = "http://10.0.2.2:8080" // Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  // Función para limpiar el mensaje de error cuando el usuario empiece a escribir
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

  const handleNext = async() => {
    // Limpiar mensaje de error previo
    setErrorMessage('');
    
    // Validación básica antes de la solicitud
    if (!username || !password) {
        setErrorMessage('Por favor, ingrese su nombre de usuario y contraseña.');
        return;
    }

    if (!URL_PUBLICA) {
      setErrorMessage('Error de configuración del servidor. Por favor, contacte al administrador.');
      return;
    }

    try {
      console.log("Intentando iniciar sesión con:", { username, password });
      
      const response = await axios.post(
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
        }
      );

      if(response.data) {
        await AsyncStorage.setItem('username', username);
        console.log("Usuario logueado y datos guardados en AsyncStorage:", response.data);
        router.replace('/(tabs)');
      } else {
        console.error("La respuesta del servidor no contiene datos esperados.");
        setErrorMessage('Error de inicio de sesión. Respuesta del servidor inesperada.');
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      // Manejo de errores más específico con Axios
      if (axios.isAxiosError(error) && error.response) {
        // El servidor respondió con un estado fuera del rango 2xx
        console.error("Error de respuesta del servidor:", error.response.status, error.response.data);
        if (error.response.status === 401) {
            // Credenciales incorrectas: limpiar campos y mostrar mensaje
            setErrorMessage('Credenciales incorrectas. Verifique su usuario y contraseña.');
            setUsername('');
            setPassword('');
        } else if (error.response.status === 403) {
            setErrorMessage('Acceso denegado. No tiene permisos para acceder.');
        } else {
            setErrorMessage(error.response.data?.message || `Error del servidor (${error.response.status})`);
        }
      } else if (axios.isAxiosError(error) && error.request) {
        // La solicitud fue hecha pero no se recibió respuesta (ej. sin conexión a internet)
        console.error("No se recibió respuesta del servidor:", error.request);
        setErrorMessage('No se pudo conectar al servidor. Verifique su conexión a internet.');
      } else {
        setErrorMessage('Error inesperado durante el inicio de sesión.');
      }
    }
  }

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
    fontSize: 24,
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
    height: 40,
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
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: "bold",
  },
});