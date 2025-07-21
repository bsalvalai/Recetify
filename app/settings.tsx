import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useNavigation, useRouter } from 'expo-router';
import { CommonActions } from '@react-navigation/native'; // Importa CommonActions
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage
import axios from 'axios'; // Importa Axios
import Colors from '@/constants/Colors';
import { useAuth } from '@/components/AuthContext';


// --- Constantes para la URL del Backend y API Key ---
const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL // Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { logout } = useAuth(); // Obtener la función logout del AuthContext
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Para manejar el estado de carga de las operaciones

  // Cargar el nombre de usuario desde AsyncStorage al montar el componente
  useEffect(() => {
    const loadUsername = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        if (username) {
          setCurrentUsername(username);
          console.log('SettingsScreen: Username cargado de AsyncStorage:', username);
        } else {
          console.log('SettingsScreen: No se encontró username en AsyncStorage.');
        }
      } catch (error) {
        console.error('SettingsScreen: Error al cargar username de AsyncStorage:', error);
      }
    };
    loadUsername();
  }, []);

  // --- Función para cerrar sesión ---
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Usar la función logout del AuthContext (que limpia AsyncStorage y estados)
      await logout();
      console.log('SettingsScreen: Logout completado desde AuthContext.');

      // Restablecer la pila de navegación a la ruta de autenticación
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: '(auth)' }, // Asegúrate de que '(auth)' sea el nombre correcto de tu grupo de rutas de autenticación
          ],
        })
      );
      console.log('SettingsScreen: Pila de navegación restablecida a (auth).');

    } catch (error) {
      console.error('SettingsScreen: Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Función para eliminar el perfil ---
  const handleDeleteProfile = async () => {
    if (!currentUsername) {
      Alert.alert('Error', 'No se pudo obtener el nombre de usuario para eliminar el perfil.');
      return;
    }

    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar tu perfil (${currentUsername})? Esta acción es irreversible.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => console.log('Eliminación de perfil cancelada.'),
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              if (!URL_PUBLICA || !API_KEY) {
                throw new Error("URL del backend o API Key no definidas.");
              }

              const deleteUrl = `${URL_PUBLICA}/user/profile/${currentUsername}`;
              console.log(`SettingsScreen: Intentando DELETE a la URL: ${deleteUrl}`);

              const response = await axios.delete(deleteUrl, {
                headers: {
                  'x-api-key': API_KEY,
                },
              });

              if (response.status === 200 || response.status === 204) {
                console.log('SettingsScreen: Perfil eliminado exitosamente del backend.');
                // Si la eliminación en el backend fue exitosa, proceder a cerrar sesión
                await AsyncStorage.removeItem('username');
                console.log('SettingsScreen: Username eliminado de AsyncStorage después de eliminar perfil.');

                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      { name: '(auth)' },
                    ],
                  })
                );
                Alert.alert('Éxito', 'Tu perfil ha sido eliminado correctamente.');
                console.log('SettingsScreen: Pila de navegación restablecida a (auth) después de eliminar perfil.');
              } else {
                throw new Error(`Error al eliminar perfil: ${response.status} ${response.statusText}`);
              }
            } catch (error) {
              console.error('SettingsScreen: Error al eliminar perfil:', error);
              if (axios.isAxiosError(error)) {
                Alert.alert('Error', error.response?.data?.message || error.message || 'No se pudo eliminar el perfil.');
              } else {
                Alert.alert('Error', 'Ocurrió un error inesperado al eliminar el perfil.');
              }
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerTitleAlign: 'center', headerShown: false}} /> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.divider}></View> {/* Usar estilo definido */}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/ayuda')} disabled={isLoading}>
          <Text style={styles.buttonText}>Ayuda</Text>
          <FontAwesome name="info-circle" size={20} color="#111" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/editarperfil')} disabled={isLoading}>
          <Text style={styles.buttonText}>Editar Perfil</Text>
          <FontAwesome name="pencil" size={20} color="#111" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/cambiarpass')} disabled={isLoading}>
          <Text style={styles.buttonText}>Cambiar clave</Text>
          <FontAwesome name="refresh" size={20} color="#111" style={styles.icon} />
        </TouchableOpacity>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity style={styles.button} onPress={handleLogout} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#111" />
          ) : (
            <>
              <Text style={styles.buttonText}>Cerrar sesión</Text>
              <FontAwesome name="sign-out" size={20} color="#111" style={styles.icon} />
            </>
          )}
        </TouchableOpacity>

        {/* Botón de Eliminar Perfil */}
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteProfile} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={[styles.buttonText, styles.deleteButtonText]}>Eliminar perfil</Text>
              <FontAwesome name="trash" size={20} color="#FFFFFF" style={styles.icon} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'regular',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 24,
  },
  // Separador corregido
  divider: {
    height: 1,
    backgroundColor: '#CCC',
    width: '100%',
  },
  buttonsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 18, // Ajustado para que el texto no se pegue al borde
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder,
    width: '100%',
    height: 54,
  },
  buttonText: {
    fontSize: 12,
    color: '#111',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, // Para que el texto ocupe el espacio y el icono se mantenga a la derecha
  },
  icon: {
    // No es necesario 'position: absolute' si el texto tiene flex: 1
    // y el contenedor tiene justifyContent: 'space-between'
  },
  deleteButton: {
    backgroundColor: Colors.light.button, // Rojo para eliminar
    borderColor: Colors.light.buttonBorder, // Mismo color de borde
  },
  deleteButtonText: {
    color: '#FFFFFF', // Texto blanco para el botón de eliminar
  },
});