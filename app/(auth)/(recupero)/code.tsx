import Colors from '@/constants/Colors';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'; // Importa ActivityIndicator y Alert
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios'; // Asegúrate de importar axios

// Asegúrate de que estas constantes estén disponibles en este archivo también
const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'dapps1-2025';

export default function RecuperoClaveCodigo() {
  const [code, setCode] = useState('');
  const [userName, setUserName] = useState<string | string[] | null>(null);
  const [errorMessage, setErrorMessage] = useState(''); // Estado para mensajes de error
  const [isLoading, setIsLoading] = useState(false);   // Estado para spinner de carga
  const [email, setEmail] = useState("")
  const router = useRouter();
  const params = useLocalSearchParams();

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (params && params.username) {
      setUserName(params.username);
      if (typeof params.email === 'string') {
        setEmail(params.email); // Asignar el email si es string
      } else if (Array.isArray(params.email) && params.email.length > 0) {
        setEmail(params.email[0]); // Asignar el primer email si es array
      }
      console.log("Username recibido en RecuperoClaveCodigo:", params.username);
      console.log("Email recibido en RecuperoClaveCodigo:", params.email);
    }
  }, [params]);

  // Asegúrate de que esta función limpia los errores al cambiar el código
  const handleCodeChange = (text: string, index: number) => {
    if (errorMessage) { // Limpiar el error si el usuario empieza a escribir de nuevo
      setErrorMessage('');
    }
    // ... tu lógica existente para manejar el cambio de código ...
    if (text.length > 1) return;
    if (text && !/^\d$/.test(text)) return;

    let newCode = code.split('');
    if (text === '') {
      newCode[index] = '';
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else {
      newCode[index] = text;
      if (index < 5 && text !== '') {
        inputRefs.current[index + 1]?.focus();
      } else if (index === 5 && text !== '') {
        inputRefs.current[index]?.blur();
      }
    }
    setCode(newCode.join(''));
  };

  const handleKeyPress = ({ nativeEvent: { key } }: any, index: number) => {
    if (key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => { // Convertir a async
    setErrorMessage(''); // Limpiar errores previos
    setIsLoading(true);   // Activar spinner

    const fullCode = code;

    // Validar que el código tenga 6 dígitos
    if (fullCode.length !== 6 || !/^\d{6}$/.test(fullCode)) {
      setErrorMessage('Por favor, ingrese un código de 6 dígitos.');
      setIsLoading(false);
      return;
    }

    if (!userName) {
      setErrorMessage('Error: Nombre de usuario no disponible.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Enviando código OTP y username para verificación...');
      const response = await axios.post(
        `${URL_PUBLICA}/user/otp/check`,
        {
          // El backend espera 'otp' y 'username' en el body
          otp: fullCode,
          username: userName, // Asegúrate de que userName no es un array aquí
        },
        {
          // Headers deben ir como tercer argumento
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': `${API_KEY}`,
          },
        }
      );

      // Si la respuesta es exitosa (status 2xx)
      console.log('Verificación OTP exitosa:', response.data);
      Alert.alert("Código Correcto", "Código verificado exitosamente. Ahora puedes establecer una nueva contraseña.");
      // Redirigir a la pantalla de nueva contraseña, pasando el username
      router.push({ pathname: '/(auth)/(recupero)/newPass', params: { username: userName } });

    } catch (error) {
      console.error('Error al verificar código OTP:', error);
      if (axios.isAxiosError(error) && error.response) {
        // El servidor respondió con un error (ej. 400 Bad Request si el OTP es inválido)
        const message = error.response.data?.message || `Error del servidor (${error.response.status}).`;
        setErrorMessage(message + ' Por favor, verifique el código e intente nuevamente.');
        Alert.alert("Error de Verificación", message);
      } else if (axios.isAxiosError(error) && error.request) {
        // La petición se hizo pero no se recibió respuesta (error de red)
        setErrorMessage('No se pudo conectar al servidor. Verifique su conexión a internet.');
        Alert.alert("Error de Conexión", "No se pudo conectar al servidor. Por favor, verifique su conexión a internet.");
      } else {
        // Otro error inesperado
        setErrorMessage('Ocurrió un error inesperado. Intente de nuevo.');
        Alert.alert("Error Inesperado", "Ocurrió un error inesperado. Por favor, intente de nuevo.");
      }
    } finally {
      setIsLoading(false); // Desactivar el spinner
    }
  };

  const handleResendCode = async () => {
    setErrorMessage(''); // Limpiar errores previos
    setIsLoading(true);   // Activar spinner

    console.log('email:', email);
    if (!email) {
      setErrorMessage('Por favor, ingrese un email válido.');
      setIsLoading(false);
      return;
    }

    if (!userName) {
      setErrorMessage('Error: Nombre de usuario no disponible.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Enviando solicitud para reenviar código al email:', email);
      const response = await axios.post(
        `${URL_PUBLICA}/user/password`,
        { email: email },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': `${API_KEY}`,
          },
        }
      );

      console.log('Código reenviado exitosamente:', response.data);
      Alert.alert("Código Reenviado", "Se ha enviado un nuevo código a su email. Por favor, revise su bandeja de entrada.");

    } catch (error) {
      console.error('Error al reenviar código:', error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data?.message || `Error del servidor (${error.response.status}).`;
        setErrorMessage(message + ' Por favor, intente nuevamente.');
        Alert.alert("Error de Reenvío", message);
      } else if (axios.isAxiosError(error) && error.request) {
        setErrorMessage('No se pudo conectar al servidor. Verifique su conexión a internet.');
        Alert.alert("Error de Conexión", "No se pudo conectar al servidor. Por favor, verifique su conexión a internet.");
      } else {
        setErrorMessage('Ocurrió un error inesperado. Intente de nuevo.');
        Alert.alert("Error Inesperado", "Ocurrió un error inesperado. Por favor, intente de nuevo.");
      }
    } finally {
      setIsLoading(false); // Desactivar el spinner
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Text style={styles.title}>Recupero de clave</Text>
      {userName ? (
        <Text style={styles.subtitle}>Hola {userName}, ingresa el código enviado a tu mail</Text>
      ) : (
        <Text style={styles.subtitle}>Ingrese el código enviado por Mail para continuar</Text>
      )}

      <View style={styles.codeContainer}>
        {[...Array(6)].map((_, i) => (
          <TextInput
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            value={code[i] || ''}
            onChangeText={text => handleCodeChange(text, i)}
            onKeyPress={e => handleKeyPress(e, i)}
            selectTextOnFocus={true}
            editable={!isLoading} // Deshabilitar inputs mientras carga
          />
        ))}
      </View>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text> // Mostrar mensaje de error
      ) : null}

      <TouchableOpacity onPress={handleResendCode}>
        <Text style={styles.resendText}>
          No recibiste el código? Presione aquí{'\n'}Para enviar nuevamente
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyCode}
        disabled={isLoading} // Deshabilitar el botón mientras carga
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" /> // Spinner dentro del botón
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
    paddingHorizontal: 16,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 40,
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  codeInput: {
    backgroundColor: Colors.light.textInput,
    borderRadius: 10,
    width: 30,
    height: 40,
    marginHorizontal: 7,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
  },
  resendText: {
    color: '#444',
    fontSize: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: "center",
    width: '100%',
    height: 54,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: { // Estilo para los mensajes de error
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
});