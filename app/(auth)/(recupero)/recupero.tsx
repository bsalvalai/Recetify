import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import axios from 'axios';

const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'dapps1-2025';

// Helper function to validate email format
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function RecuperoClaveEmail() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleMailSender = async () => {
    setErrorMessage('');
    setIsLoading(true);

    if (!email) {
      setErrorMessage('Por favor, ingrese su email.');
      setIsLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage('Por favor, ingrese un formato de email válido.');
      setIsLoading(false);
      return;
    }
    if (!URL_PUBLICA) {
      setErrorMessage('Error de configuración: URL del backend no definida.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('1. Intentando verificar email y obtener username:', email);
      const emailCheckResponse = await axios.get(`${URL_PUBLICA}/user/mail/${email}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${API_KEY}`,
        },
      });

      const username = emailCheckResponse.data.username;
      console.log('Email verificado. Nombre de usuario obtenido:', username);

      console.log('2. Enviando petición POST para iniciar recuperación de contraseña...');
      const passwordRecoveryResponse = await axios.post(`${URL_PUBLICA}/user/password`, {
        email: email,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${API_KEY}`,
        },
      });

      console.log('Petición de recuperación de contraseña enviada correctamente. Respuesta POST:', passwordRecoveryResponse.data);

      Alert.alert(
        "Email Enviado",
        "Si su email está registrado, se le ha enviado un código de recuperación. Por favor, revise su bandeja de entrada.",
        [{
          text: "OK",
          onPress: () => router.push({ pathname: "/(auth)/(recupero)/code", params: { username: username, email: email } })
        }]
      );

    } catch (error) {
      // Manejo de errores simplificado
      console.error('Error en el flujo de recuperación de clave:', error);

      if (axios.isAxiosError(error) && error.response) {
        // Error recibido del servidor (ej. 400, 404, 500)
        // Puedes intentar usar error.response.data.message si tu backend envía mensajes en el cuerpo
        // Si no, puedes mostrar un mensaje genérico para errores de servidor
        const message = error.response.data?.message || `Error del servidor (${error.response.status}).`;
        setErrorMessage(message + ' Por favor, verifique el email o intente de nuevo.');
        Alert.alert("Error", message);

      } else if (axios.isAxiosError(error) && error.request) {
        // No se recibió respuesta del servidor (ej. sin conexión a internet)
        setErrorMessage('No se pudo conectar al servidor. Verifique su conexión a internet.');
        Alert.alert("Error de Conexión", "No se pudo conectar al servidor. Por favor, verifique su conexión a internet.");
      } else {
        // Otros errores inesperados
        setErrorMessage('Ocurrió un error inesperado. Intente de nuevo.');
        Alert.alert("Error Inesperado", "Ocurrió un error inesperado. Por favor, intente de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Text style={styles.title}>Recupero de clave</Text>
      <Text style={styles.subtitle}>Ingrese su email registrado en la cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su email..."
        placeholderTextColor="#000"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleMailSender}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Siguiente</Text>
        )}
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
    paddingBottom: 100
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 35,
    color: '#000',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 15,
    color: '#222',
    marginBottom: 40,
    textAlign: 'center'
  },
  input: {
    backgroundColor: Colors.light.textInput,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 40,
    width: '100%',
    color: '#111'
  },
  button: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%'
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
});