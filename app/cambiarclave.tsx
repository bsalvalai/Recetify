import React, { useState } from 'react';
<<<<<<< Updated upstream
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CambiarClaveScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar clave</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.separator} />

      <View style={styles.content}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Nueva clave</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••••"
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <FontAwesome 
                name={showNewPassword ? "eye" : "eye-slash"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Confirme la clave</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••••"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesome 
                name={showConfirmPassword ? "eye" : "eye-slash"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningLabel}>Advertencia:</Text>
          <Text style={styles.warningText}>
            Vas a recibir un correo electrónico para confirmar el cambio de clave
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Siguiente</Text>
=======
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const URL_PUBLICA = "http://10.0.2.2:8080";
const API_KEY = 'dapps1-2025';

export default function CambiarClaveScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  const handlePasswordChange = async () => {
    setErrorMessage('');
    
    // Validaciones básicas
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Por favor, complete todos los campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    setIsLoading(true);

    try {
      // Obtener el username del usuario logueado
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        setErrorMessage('Error: Usuario no encontrado. Por favor, inicie sesión nuevamente.');
        setIsLoading(false);
        return;
      }

      // Verificar la contraseña actual
      const loginResponse = await axios.post(
        `${URL_PUBLICA}/user/login`,
        {
          username: username,
          password: currentPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      if (!loginResponse.data) {
        setErrorMessage('La contraseña actual es incorrecta.');
        setIsLoading(false);
        return;
      }

      // Si llegamos aquí, la contraseña actual es correcta
      // Ahora cambiamos la contraseña
      const changeResponse = await axios.put(
        `${URL_PUBLICA}/user/password`,
        {
          username: username,
          new_password: newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      if (changeResponse.status === 200) {
        Alert.alert(
          'Éxito',
          'Su contraseña ha sido cambiada exitosamente.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        setErrorMessage('Error al cambiar la contraseña. Intente nuevamente.');
      }

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setErrorMessage('La contraseña actual es incorrecta.');
          setCurrentPassword(''); // Limpiar la contraseña incorrecta
        } else if (error.response?.status === 404) {
          setErrorMessage('Usuario no encontrado.');
        } else {
          setErrorMessage(error.response?.data?.message || 'Error del servidor. Intente nuevamente.');
        }
      } else {
        setErrorMessage('Error de conexión. Verifique su internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerTitleAlign: 'center', headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar Clave</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[{ backgroundColor: "#000" }, { width: "100%" }, { height: 1 }]}></View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Cambiar Contraseña</Text>
        <Text style={styles.subtitle}>
          Para tu seguridad, ingresa tu contraseña actual y define una nueva contraseña.
        </Text>

        {/* Contraseña Actual */}
        <Text style={styles.label}>Contraseña actual</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Ingrese su contraseña actual..."
            placeholderTextColor="#888"
            secureTextEntry={!showCurrentPass}
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              clearError();
            }}
            editable={!isLoading}
          />
          <Pressable onPress={() => setShowCurrentPass(!showCurrentPass)} style={styles.eyeIcon}>
            <Ionicons name={showCurrentPass ? "eye" : "eye-off"} size={22} color="#a94442" />
          </Pressable>
        </View>

        {/* Nueva Contraseña */}
        <Text style={styles.label}>Nueva contraseña</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Ingrese su nueva contraseña..."
            placeholderTextColor="#888"
            secureTextEntry={!showNewPass}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              clearError();
            }}
            editable={!isLoading}
          />
          <Pressable onPress={() => setShowNewPass(!showNewPass)} style={styles.eyeIcon}>
            <Ionicons name={showNewPass ? "eye" : "eye-off"} size={22} color="#a94442" />
          </Pressable>
        </View>

        {/* Confirmar Nueva Contraseña */}
        <Text style={styles.label}>Confirme la nueva contraseña</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Confirme su nueva contraseña..."
            placeholderTextColor="#888"
            secureTextEntry={!showConfirmPass}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearError();
            }}
            editable={!isLoading}
          />
          <Pressable onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeIcon}>
            <Ionicons name={showConfirmPass ? "eye" : "eye-off"} size={22} color="#a94442" />
          </Pressable>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handlePasswordChange}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          )}
>>>>>>> Stashed changes
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< Updated upstream
    backgroundColor: '#F0F0F0',
=======
    backgroundColor: Colors.light.background,
>>>>>>> Stashed changes
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
<<<<<<< Updated upstream
    backgroundColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    flex: 1,
=======
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111',
    textAlign: 'center',
>>>>>>> Stashed changes
  },
  placeholder: {
    width: 24,
  },
<<<<<<< Updated upstream
  separator: {
    height: 1,
    backgroundColor: '#CCC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  fieldContainer: {
    marginBottom: 40,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 15,
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD6D6',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#111',
  },
  eyeButton: {
    padding: 5,
  },
  warningContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  warningLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 5,
  },
  warningText: {    
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  nextButton: {
    backgroundColor: '#D32F2F',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
=======
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 10,
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: '#000000ff',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.light.textInput,
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 46,
  },
  input: {
    fontSize: 14,
    color: '#111',
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -10,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    height: 54,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
>>>>>>> Stashed changes
